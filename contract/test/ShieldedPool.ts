import { expect } from 'chai';
import { ethers, fhevm } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { keccak256, toUtf8Bytes, AbiCoder } from 'ethers';

describe('ShieldedPool', function () {
  let token: any;
  let pool: any;
  let owner: any;
  let depositor: any;
  let merchant: any;
  let other: any;

  const INITIAL_AMOUNT = 1000;
  const DEPOSIT_AMOUNT = 100;
  const RESOURCE_ID = keccak256(toUtf8Bytes('premium-data-v1'));
  const ONE_HOUR = 60 * 60;

  function commitmentFor(secret: string, resourceId: string, expiry: number): string {
    return keccak256(
      AbiCoder.defaultAbiCoder().encode(['bytes32', 'bytes32', 'uint64'], [secret, resourceId, expiry])
    );
  }

  beforeEach(async function () {
    [owner, depositor, merchant, other] = await ethers.getSigners();

    token = await ethers.deployContract('ERC7984Example', [
      owner.address,
      INITIAL_AMOUNT,
      'Confidential Token',
      'CTKN',
      'https://example.com/token',
    ]);

    pool = await ethers.deployContract('ShieldedPool', [await token.getAddress(), owner.address]);

    // Fund the depositor first (owner -> depositor), same pattern as ERC7984.ts's transfer test.
    const fundInput = await fhevm
      .createEncryptedInput(await token.getAddress(), owner.address)
      .add64(INITIAL_AMOUNT)
      .encrypt();
    await token
      .connect(owner)
      ['confidentialTransfer(address,bytes32,bytes)'](depositor.address, fundInput.handles[0], fundInput.inputProof);
  });

  async function registerMerchant() {
    await pool.connect(owner).registerResource(RESOURCE_ID, merchant.address);
  }

  async function grantOperator(signer: any) {
    const until = (await time.latest()) + ONE_HOUR;
    await token.connect(signer).setOperator(await pool.getAddress(), until);
  }

  describe('Resource registration', function () {
    it('lets the owner register a resourceId -> payout address', async function () {
      await expect(pool.connect(owner).registerResource(RESOURCE_ID, merchant.address))
        .to.emit(pool, 'ResourceRegistered')
        .withArgs(RESOURCE_ID, merchant.address);
      expect(await pool.payoutAddressOf(RESOURCE_ID)).to.equal(merchant.address);
    });

    it('reverts if a non-owner tries to register a resource', async function () {
      await expect(pool.connect(other).registerResource(RESOURCE_ID, merchant.address)).to.be.revertedWithCustomError(
        pool,
        'OwnableUnauthorizedAccount'
      );
    });

    it('reverts on double registration of the same resourceId', async function () {
      await registerMerchant();
      await expect(pool.connect(owner).registerResource(RESOURCE_ID, other.address))
        .to.be.revertedWithCustomError(pool, 'ShieldedPool__ResourceAlreadyRegistered')
        .withArgs(RESOURCE_ID);
    });

    it('lets the current payout address rotate itself, and rejects anyone else', async function () {
      await registerMerchant();
      await expect(pool.connect(merchant).updatePayoutAddress(RESOURCE_ID, other.address))
        .to.emit(pool, 'PayoutAddressUpdated')
        .withArgs(RESOURCE_ID, merchant.address, other.address);
      expect(await pool.payoutAddressOf(RESOURCE_ID)).to.equal(other.address);

      await expect(pool.connect(merchant).updatePayoutAddress(RESOURCE_ID, merchant.address))
        .to.be.revertedWithCustomError(pool, 'ShieldedPool__NotCurrentPayoutAddress')
        .withArgs(RESOURCE_ID, merchant.address);
    });
  });

  describe('Deposit + commitment registration (atomic)', function () {
    it('deposits confidentially into the pool and registers a commitment in one tx', async function () {
      await registerMerchant();
      await grantOperator(depositor);

      const secret = ethers.hexlify(ethers.randomBytes(32));
      const expiry = (await time.latest()) + ONE_HOUR;
      const commitment = commitmentFor(secret, RESOURCE_ID, expiry);

      const depositInput = await fhevm
        .createEncryptedInput(await pool.getAddress(), depositor.address)
        .add64(DEPOSIT_AMOUNT)
        .encrypt();

      await expect(
        pool
          .connect(depositor)
          .depositAndRegister(depositInput.handles[0], depositInput.inputProof, commitment, RESOURCE_ID, expiry)
      )
        .to.emit(pool, 'CommitmentRegistered')
        .withArgs(RESOURCE_ID, commitment, expiry);

      expect(await pool.isCommitmentValid(commitment, RESOURCE_ID)).to.equal(true);

      // Pool's aggregate confidential balance handle now exists (moved off the depositor).
      const poolBalanceHandle = await token.confidentialBalanceOf(await pool.getAddress());
      expect(poolBalanceHandle).to.not.be.undefined;
    });

    it('reverts if the resourceId was never registered', async function () {
      await grantOperator(depositor);
      const secret = ethers.hexlify(ethers.randomBytes(32));
      const expiry = (await time.latest()) + ONE_HOUR;
      const commitment = commitmentFor(secret, RESOURCE_ID, expiry);

      const depositInput = await fhevm
        .createEncryptedInput(await pool.getAddress(), depositor.address)
        .add64(DEPOSIT_AMOUNT)
        .encrypt();

      await expect(
        pool
          .connect(depositor)
          .depositAndRegister(depositInput.handles[0], depositInput.inputProof, commitment, RESOURCE_ID, expiry)
      )
        .to.be.revertedWithCustomError(pool, 'ShieldedPool__ResourceNotRegistered')
        .withArgs(RESOURCE_ID);
    });

    it('reverts on commitment replay', async function () {
      await registerMerchant();
      await grantOperator(depositor);

      const secret = ethers.hexlify(ethers.randomBytes(32));
      const expiry = (await time.latest()) + ONE_HOUR;
      const commitment = commitmentFor(secret, RESOURCE_ID, expiry);

      const depositInput1 = await fhevm
        .createEncryptedInput(await pool.getAddress(), depositor.address)
        .add64(DEPOSIT_AMOUNT)
        .encrypt();
      await pool
        .connect(depositor)
        .depositAndRegister(depositInput1.handles[0], depositInput1.inputProof, commitment, RESOURCE_ID, expiry);

      const depositInput2 = await fhevm
        .createEncryptedInput(await pool.getAddress(), depositor.address)
        .add64(DEPOSIT_AMOUNT)
        .encrypt();
      await expect(
        pool
          .connect(depositor)
          .depositAndRegister(depositInput2.handles[0], depositInput2.inputProof, commitment, RESOURCE_ID, expiry)
      )
        .to.be.revertedWithCustomError(pool, 'ShieldedPool__CommitmentAlreadyUsed')
        .withArgs(commitment);
    });

    it('reverts if expiry is not in the future', async function () {
      await registerMerchant();
      await grantOperator(depositor);

      const secret = ethers.hexlify(ethers.randomBytes(32));
      const pastExpiry = (await time.latest()) - 1;
      const commitment = commitmentFor(secret, RESOURCE_ID, pastExpiry);

      const depositInput = await fhevm
        .createEncryptedInput(await pool.getAddress(), depositor.address)
        .add64(DEPOSIT_AMOUNT)
        .encrypt();

      await expect(
        pool
          .connect(depositor)
          .depositAndRegister(depositInput.handles[0], depositInput.inputProof, commitment, RESOURCE_ID, pastExpiry)
      ).to.be.revertedWithCustomError(pool, 'ShieldedPool__ExpiryInPast');
    });

    it('CRITICAL ANTI-BYPASS CHECK: cannot register a commitment without an actual fund transfer (no standalone registerCommitment exists; depositAndRegister is the only entry point, and it reverts atomically if the transfer cannot happen)', async function () {
      await registerMerchant();
      // Deliberately skip grantOperator(depositor) — simulates an attacker with no real funds/approval
      // trying to obtain a valid commitment (and therefore a session token) for free.

      const secret = ethers.hexlify(ethers.randomBytes(32));
      const expiry = (await time.latest()) + ONE_HOUR;
      const commitment = commitmentFor(secret, RESOURCE_ID, expiry);

      const depositInput = await fhevm
        .createEncryptedInput(await pool.getAddress(), depositor.address)
        .add64(DEPOSIT_AMOUNT)
        .encrypt();

      await expect(
        pool
          .connect(depositor)
          .depositAndRegister(depositInput.handles[0], depositInput.inputProof, commitment, RESOURCE_ID, expiry)
      ).to.be.revertedWithCustomError(token, 'ERC7984UnauthorizedSpender');

      // The whole call reverted atomically — confirm the commitment was NOT left registered.
      expect(await pool.isCommitmentValid(commitment, RESOURCE_ID)).to.equal(false);
    });

    it('a commitment expires: isCommitmentValid flips to false with no additional tx', async function () {
      await registerMerchant();
      await grantOperator(depositor);

      const secret = ethers.hexlify(ethers.randomBytes(32));
      const expiry = (await time.latest()) + ONE_HOUR;
      const commitment = commitmentFor(secret, RESOURCE_ID, expiry);

      const depositInput = await fhevm
        .createEncryptedInput(await pool.getAddress(), depositor.address)
        .add64(DEPOSIT_AMOUNT)
        .encrypt();
      await pool
        .connect(depositor)
        .depositAndRegister(depositInput.handles[0], depositInput.inputProof, commitment, RESOURCE_ID, expiry);

      expect(await pool.isCommitmentValid(commitment, RESOURCE_ID)).to.equal(true);

      await time.increase(ONE_HOUR + 1);

      expect(await pool.isCommitmentValid(commitment, RESOURCE_ID)).to.equal(false);
    });

    it('KNOWN LIMITATION (documented, not a bug to silently fix): a commitment for the wrong resourceId reads as invalid, confirming resourceId is bound at registration time', async function () {
      await registerMerchant();
      await grantOperator(depositor);

      const secret = ethers.hexlify(ethers.randomBytes(32));
      const expiry = (await time.latest()) + ONE_HOUR;
      const commitment = commitmentFor(secret, RESOURCE_ID, expiry);

      const depositInput = await fhevm
        .createEncryptedInput(await pool.getAddress(), depositor.address)
        .add64(DEPOSIT_AMOUNT)
        .encrypt();
      await pool
        .connect(depositor)
        .depositAndRegister(depositInput.handles[0], depositInput.inputProof, commitment, RESOURCE_ID, expiry);

      const otherResourceId = keccak256(toUtf8Bytes('some-other-resource'));
      expect(await pool.isCommitmentValid(commitment, otherResourceId)).to.equal(false);
    });
  });

  describe('Merchant claim', function () {
    beforeEach(async function () {
      await registerMerchant();
      await grantOperator(depositor);

      const secret = ethers.hexlify(ethers.randomBytes(32));
      const expiry = (await time.latest()) + ONE_HOUR;
      const commitment = commitmentFor(secret, RESOURCE_ID, expiry);

      const depositInput = await fhevm
        .createEncryptedInput(await pool.getAddress(), depositor.address)
        .add64(DEPOSIT_AMOUNT)
        .encrypt();
      await pool
        .connect(depositor)
        .depositAndRegister(depositInput.handles[0], depositInput.inputProof, commitment, RESOURCE_ID, expiry);
    });

    it('lets the registered payout address claim from the pool aggregate balance', async function () {
      const claimInput = await fhevm
        .createEncryptedInput(await pool.getAddress(), merchant.address)
        .add64(DEPOSIT_AMOUNT)
        .encrypt();

      await expect(pool.connect(merchant).claim(RESOURCE_ID, claimInput.handles[0], claimInput.inputProof))
        .to.emit(pool, 'Claimed')
        .withArgs(RESOURCE_ID, merchant.address);

      const merchantBalanceHandle = await token.confidentialBalanceOf(merchant.address);
      expect(merchantBalanceHandle).to.not.be.undefined;
    });

    it('reverts when a non-payout address attempts to claim', async function () {
      const claimInput = await fhevm
        .createEncryptedInput(await pool.getAddress(), other.address)
        .add64(DEPOSIT_AMOUNT)
        .encrypt();

      await expect(pool.connect(other).claim(RESOURCE_ID, claimInput.handles[0], claimInput.inputProof))
        .to.be.revertedWithCustomError(pool, 'ShieldedPool__NotPayoutAddress')
        .withArgs(RESOURCE_ID, other.address);
    });

    it('reverts when claiming for an unregistered resourceId', async function () {
      const unregisteredResourceId = keccak256(toUtf8Bytes('never-registered'));
      const claimInput = await fhevm
        .createEncryptedInput(await pool.getAddress(), merchant.address)
        .add64(DEPOSIT_AMOUNT)
        .encrypt();

      await expect(
        pool.connect(merchant).claim(unregisteredResourceId, claimInput.handles[0], claimInput.inputProof)
      )
        .to.be.revertedWithCustomError(pool, 'ShieldedPool__NotPayoutAddress')
        .withArgs(unregisteredResourceId, merchant.address);
    });
  });
});
