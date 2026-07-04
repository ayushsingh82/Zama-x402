// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://v2.hardhat.org/ignition
//
// Usage:
//   npx hardhat ignition deploy ignition/modules/ShieldedPool.ts --network sepolia \
//     --parameters '{"ShieldedPoolModule":{"token":"0xYourDeployedERC7984TokenAddress"}}'
//
// Defaults to the token address already documented as deployed on Sepolia in X402_SETUP.md
// (NEXT_PUBLIC_TOKEN_ADDRESS), and to the first configured account as owner.

import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const DEFAULT_TOKEN_ADDRESS = '0x803d7ADD44B238F40106B1C4439ecAcd05910dc7';

const ShieldedPoolModule = buildModule('ShieldedPoolModule', (m) => {
  const token = m.getParameter('token', DEFAULT_TOKEN_ADDRESS);
  const owner = m.getParameter('owner', m.getAccount(0));

  const shieldedPool = m.contract('ShieldedPool', [token, owner]);

  return { shieldedPool };
});

export default ShieldedPoolModule;
