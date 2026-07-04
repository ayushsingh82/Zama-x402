// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {Ownable2Step, Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {FHE, externalEuint64, euint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {IERC7984} from "@openzeppelin/confidential-contracts/interfaces/IERC7984.sol";

/**
 * @title ShieldedPool
 * @notice Phase 1 of Zama-X402's bidirectional-blindness upgrade: merchants never appear in the
 * x402 402 response or in the payer's transaction (payments land on this pool's own address), and
 * the server that gates access never learns the payer's wallet (it checks a commitment hash instead).
 *
 * Deliberately NOT solved here (see README "Known limitations"): the depositing wallet is still
 * visible on-chain as msg.sender of the deposit transaction, and payment amount is not enforced
 * on-chain against the resource's price. Both are documented, accepted MVP trade-offs.
 *
 * Design: one AGGREGATE confidential balance for the whole pool (not per-commitment sub-accounting).
 * Merchants withdraw whenever via `claim`, decoupled in time and amount from any specific deposit —
 * this breaks deposit-to-payout correlation more strongly than a per-commitment claim scheme would,
 * and since amounts stay FHE-encrypted throughout, there is no plaintext-amount heuristic available
 * to an observer either.
 */
contract ShieldedPool is ZamaEthereumConfig, Ownable2Step {
    IERC7984 public immutable TOKEN;

    struct CommitmentInfo {
        bool used;
        bytes32 resourceId;
        uint64 expiry;
    }

    // Deliberately no amount/depositor field: the getter/event surface never re-exposes who paid
    // or how much, even though msg.sender is unavoidably visible in the raw deposit transaction.
    mapping(bytes32 commitment => CommitmentInfo) private _commitments;
    mapping(bytes32 resourceId => address payoutAddress) public payoutAddressOf;

    event ResourceRegistered(bytes32 indexed resourceId, address indexed payoutAddress);
    event PayoutAddressUpdated(
        bytes32 indexed resourceId,
        address indexed oldPayoutAddress,
        address indexed newPayoutAddress
    );
    event CommitmentRegistered(bytes32 indexed resourceId, bytes32 indexed commitment, uint64 expiry);
    event Claimed(bytes32 indexed resourceId, address indexed payoutAddress);

    error ShieldedPool__ZeroAddress();
    error ShieldedPool__ResourceAlreadyRegistered(bytes32 resourceId);
    error ShieldedPool__ResourceNotRegistered(bytes32 resourceId);
    error ShieldedPool__NotCurrentPayoutAddress(bytes32 resourceId, address caller);
    error ShieldedPool__NotPayoutAddress(bytes32 resourceId, address caller);
    error ShieldedPool__CommitmentAlreadyUsed(bytes32 commitment);
    error ShieldedPool__ExpiryInPast(uint64 expiry);

    constructor(address token_, address owner_) Ownable(owner_) {
        if (token_ == address(0)) revert ShieldedPool__ZeroAddress();
        TOKEN = IERC7984(token_);
    }

    /**
     * @dev Registers a merchant's real payout address for a resourceId. Gated to the pool owner
     * (not permissionless) to prevent resourceId-squatting: a permissionless registerResource would
     * let an attacker front-run the real merchant and hijack all future claims for that resource.
     */
    function registerResource(bytes32 resourceId, address payoutAddress) external onlyOwner {
        if (payoutAddress == address(0)) revert ShieldedPool__ZeroAddress();
        if (payoutAddressOf[resourceId] != address(0)) {
            revert ShieldedPool__ResourceAlreadyRegistered(resourceId);
        }
        payoutAddressOf[resourceId] = payoutAddress;
        emit ResourceRegistered(resourceId, payoutAddress);
    }

    /// @dev Self-service payout-address rotation by whoever currently holds it for a resourceId.
    function updatePayoutAddress(bytes32 resourceId, address newPayoutAddress) external {
        address current = payoutAddressOf[resourceId];
        if (current != msg.sender) revert ShieldedPool__NotCurrentPayoutAddress(resourceId, msg.sender);
        if (newPayoutAddress == address(0)) revert ShieldedPool__ZeroAddress();
        payoutAddressOf[resourceId] = newPayoutAddress;
        emit PayoutAddressUpdated(resourceId, current, newPayoutAddress);
    }

    /**
     * @dev Atomically deposits an encrypted amount into the pool's aggregate balance AND registers
     * a commitment in one transaction. Deposit and commitment registration must be atomic: if they
     * were two separate calls, a user could register a commitment and obtain a session token without
     * ever depositing anything (a full payment-bypass, not just a pricing gap).
     *
     * Caller must have already granted this pool operator status on the token
     * (`token.setOperator(poolAddress, until)`), the standard ERC7984 allowance idiom — mirrors
     * ERC20 approve+transferFrom. The encrypted input must be created client-side targeting THIS
     * POOL's address (not the token) as the contract, with the depositor as the signer — because
     * this function itself calls `FHE.fromExternal`, and the FHEVM input-verification proof is bound
     * to (contractAddress, callerAddress) = (address(this) at the point fromExternal executes,
     * msg.sender). Passing raw externalEuint64/proof straight through to the token's own overload
     * does NOT work here, because the token would see the pool (not the depositor) as msg.sender —
     * confirmed empirically via `InvalidSigner()` reverts in contract/test/ShieldedPool.ts before this
     * was fixed. This mirrors OpenZeppelin's own `VestingWalletConfidentialFactory` pattern.
     */
    function depositAndRegister(
        externalEuint64 encryptedAmount,
        bytes calldata inputProof,
        bytes32 commitment,
        bytes32 resourceId,
        uint64 expiry
    ) external {
        if (payoutAddressOf[resourceId] == address(0)) revert ShieldedPool__ResourceNotRegistered(resourceId);
        if (_commitments[commitment].used) revert ShieldedPool__CommitmentAlreadyUsed(commitment);
        if (expiry <= block.timestamp) revert ShieldedPool__ExpiryInPast(expiry);

        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        FHE.allowTransient(amount, address(TOKEN));
        // Moves funds into this pool's own aggregate confidential balance. The token enforces
        // isOperator(msg.sender, address(this)) internally and handles all FHE ACL bookkeeping.
        TOKEN.confidentialTransferFrom(msg.sender, address(this), amount);

        _commitments[commitment] = CommitmentInfo({used: true, resourceId: resourceId, expiry: expiry});
        emit CommitmentRegistered(resourceId, commitment, expiry);
    }

    /// @dev The single read our server-side session-verification route needs.
    function isCommitmentValid(bytes32 commitment, bytes32 resourceId) external view returns (bool) {
        CommitmentInfo storage info = _commitments[commitment];
        return info.used && info.resourceId == resourceId && info.expiry > block.timestamp;
    }

    /**
     * @dev Merchant withdraws from the pool's aggregate balance whenever they choose, decoupled from
     * any specific deposit/commitment. Restricted to the resource's registered payout address.
     *
     * Known limitation: amount is not checked against accrued revenue on-chain. FHESafeMath's
     * tryDecrease silently caps an over-claim at the pool's real balance rather than reverting, so a
     * claim for more than what's available simply moves 0 tokens rather than failing loudly — the
     * merchant must decrypt the resulting ConfidentialTransfer amount client-side to detect this.
     * The encrypted input must be created client-side targeting THIS POOL's address (not the token),
     * with the claiming merchant as signer — same reasoning as in depositAndRegister.
     */
    function claim(bytes32 resourceId, externalEuint64 encryptedAmount, bytes calldata inputProof) external {
        address payout = payoutAddressOf[resourceId];
        if (payout != msg.sender) revert ShieldedPool__NotPayoutAddress(resourceId, msg.sender);

        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        FHE.allowTransient(amount, address(TOKEN));
        TOKEN.confidentialTransfer(payout, amount);
        emit Claimed(resourceId, payout);
    }
}
