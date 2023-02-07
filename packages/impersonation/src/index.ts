import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { ethers } from 'ethers';
// eslint-disable-next-line import/no-extraneous-dependencies
import { abiJsonPoolDataProvider } from './abi';
import { erc20tokens } from './constants';

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'startImpersonation':
      const provider = new ethers.providers.JsonRpcProvider(
        'https://eth-goerli.g.alchemy.com/v2/4z4XbEaY9IO4orJ2dDIY6Mbj-9-k75DH',
      );

      const poolAddressProviderAddress =
        '0xC911B590248d127aD18546B186cC6B324e99F02c';
      const uiPoolDataProviderAddress =
        '0xb00A75686293Fea5DA122E8361f6815A0B0AF48E';

      const addrToImpersonate = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'Prompt',
          fields: {
            title: 'Impersonation',
            description: 'Enter the address to impersonate',
            placeholder: '0x...',
          },
        },
      });

      const uiPoolDataProvider = new ethers.Contract(
        uiPoolDataProviderAddress,
        abiJsonPoolDataProvider,
        provider,
      );

      // Calling a read-only function on the contract
      const response = await uiPoolDataProvider.getUserReservesData(
        poolAddressProviderAddress,
        addrToImpersonate as string,
      );

      let collateralList = [];

      for (let i = 0; i < response.length; i++) {
        if (response[i].usageAsCollateralEnabledOnUser) {
          let tokenName;
          let tokenDecimal;
          for (let j = 0; j < 8; j++) {
            if (erc20tokens[j].address === response[i][0]) {
              tokenName = erc20tokens[i].name;
              tokenDecimal = erc20tokens[i].decimals;
            }
          }
          collateralList.push({
            name: tokenName,
            address: response[i][0],
            balance:
              Number(response[i].scaledATokenBalance.toString()) /
              10 ** tokenDecimal,
          });
        }
      }

      await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'Alert',
          fields: {
            title: 'Impersonation',
            description: `The address ${addrToImpersonate} has the following collateral:`,
            textAreaContent: JSON.stringify(collateralList),
          },
        },
      });

      break;
    default:
      throw new Error('Method not found.');
  }
};