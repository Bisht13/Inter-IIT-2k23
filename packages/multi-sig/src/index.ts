import { OnCronjobHandler, OnRpcRequestHandler } from '@metamask/snaps-types';
import { ethers } from 'ethers';
import {
  multisigFactoryAbi,
  safeAbi,
} from './abi';

import './safeTxHelpers'
import { initiateTx } from './safeTxHelpers';

const getAccount = async () => {
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });
  return accounts[0];
};

const getProvider = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  return provider;
};

const processSign = (signer_: string, data_: string, dynamic_: boolean) => {
  let safeSign = {
    signer: signer_,
    data: data_,
    dynamic: dynamic_,
  };
  return safeSign;
};

const buildSignatureBytes = (signatures: any) => {
  const signatureLengthBytes = 65;
  signatures.sort((left: any, right: any) => {
    console.log(left.signer);
    left.signer.toLowerCase().localeCompare(right.signer.toLowerCase());
  });

  let signatureBytes = '0x';
  let dynamicBytes = '';
  for (const sig of signatures) {
    if (sig.dynamic) {
      const dynamicPartPosition = (
        signatures.length * signatureLengthBytes +
        dynamicBytes.length / 2
      )
        .toString(16)
        .padStart(64, '0');
      const dynamicPartLength = (sig.data.slice(2).length / 2)
        .toString(16)
        .padStart(64, '0');
      const staticSignature = `${sig.signer
        .slice(2)
        .padStart(64, '0')}${dynamicPartPosition}00`;
      const dynamicPartWithLength = `${dynamicPartLength}${sig.data.slice(2)}`;

      signatureBytes += staticSignature;
      dynamicBytes += dynamicPartWithLength;
    } else {
      signatureBytes += sig.data.slice(2);
    }
  }

  return signatureBytes + dynamicBytes;
};

const executeTx = async (
  safeAddr: any,
  owner: any,
  processed_sign_array: any,
  txData: any,
) => {
  const safeInstance = new ethers.Contract(safeAddr, safeAbi, owner);
  const final_signs = buildSignatureBytes(processed_sign_array);

  txData.value = ethers.BigNumber.from(txData.value);

  console.log('txData.to : ', txData.to);
  console.log('txData.value : ', typeof txData.value);
  console.log('final_signs : ', final_signs);

  const tx = await safeInstance
    .connect(owner)
    .execTransaction(
      txData.to.toString(),
      txData.value,
      '0x',
      0,
      0,
      0,
      0,
      '0x0000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000',
      final_signs,
      {},
    );
  const receipt = await tx.wait();
  return receipt;
};


export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'initiateTxn': {
      const provider = await getProvider();
      const account = await getAccount();
      const owner = provider.getSigner(account);
      const state: any = await snap.request({
        method: 'snap_manageState',
        params: { operation: 'get' },
      });
      let safe;

      if (!state) {
        await snap.request({
          method: 'snap_confirm',
          params: [
            {
              prompt: 'No Safe!',
              description: "Safe doesn't exists",
              textAreaContent: `Create a safe first`,
            },
          ],
        });
      } else {
        safe = state.safeAccount[0].toString();

        const sendEthInputs = await snap.request({
          method: 'snap_dialog',
          params: {
            type: 'Prompt',
            fields: {
              title: 'Tx Setup',
              description:
                'Enter the Address and Value to send in the format: 0xAddress,Value',
            },
          },
        });

        const input = (sendEthInputs as string).split(',');
        const toAddr = input[0];
        const value = input[1];
        const safeInstance = new ethers.Contract(safe, safeAbi, owner);

        await initiateTx(safeInstance,owner,toAddr,value,1,account);        
      }
      break;
    }

    case 'createSafe': {
      const ZERO_ADDR = '0x0000000000000000000000000000000000000000';
      const provider = await getProvider();
      const account = await getAccount();
      const owner = provider.getSigner(account);

      const sigfactory = new ethers.Contract(
        '0x0Fa4E505896e5DCAA28dF8AdCDe0e4b521E4b4a6',
        multisigFactoryAbi,
        owner,
      );

      const state: any = await snap.request({
        method: 'snap_manageState',
        params: { operation: 'get' },
      });

      let safeAddress: any;
      let safeOwnerAddresses = [];
      let safeThreshold: any;

      if (state) {
        safeAddress = state.safeAccount[0].toString();
        const isafe = new ethers.Contract(safeAddress, safeAbi, owner);
        safeThreshold = await isafe.getThreshold();
        safeOwnerAddresses = await isafe.getOwners();
      } else {
        const inputOwners = await snap.request({
          method: 'snap_dialog',
          params: {
            type: 'Prompt',
            fields: {
              title: 'Safe Setup',
              description:
                "Enter the owners of the safe separated by comma. e.g. ['0xaddedf...','0xgdgjenk...']",
            },
          },
        });

        const input = (inputOwners as string).split(',');

        for (let i = 0; i < input.length; i++) {
          safeOwnerAddresses.push(input[i]);
        }

        safeThreshold = await snap.request({
          method: 'snap_dialog',
          params: {
            type: 'Prompt',
            fields: {
              title: 'Safe Setup',
              description:
                'Enter the threshold of signatures to be signed for execution of transaction',
            },
          },
        });

        const safeImpl_ = '0x3E5c63644E683549055b9Be8653de26E0B4CD36E';
        const tx = await sigfactory
          .connect(owner)
          .createSafe(
            safeImpl_,
            safeOwnerAddresses,
            safeThreshold,
            ZERO_ADDR,
            '0x00',
            ZERO_ADDR,
            ZERO_ADDR,
            '0',
            ZERO_ADDR,
          );
        const rc = await tx.wait();
        const event_ = rc.events.find((x: any) => x.event === 'SafeCreated');
        safeAddress = event_.args.clone;

        await snap.request({
          method: 'snap_manageState',
          params: {
            operation: 'update',
            newState: { safeAccount: [`${safeAddress.toString()}`] },
          },
        });
        
        // Send a transaction
        let txparam = {
          to: safeAddress,
          value: ethers.utils.parseEther('0.05')
        }
        await owner.sendTransaction(txparam);
      }

      // Create JSON object to send to backend
      const safeData = {
        safeAddr: safeAddress,
        owners: safeOwnerAddresses,
        threshold: safeThreshold.toString(),
      };

      // Send post request to backend
      await fetch(
        'https://metamask-snaps.sdslabs.co/backend/api/createSafe',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(safeData),
        },
      );

      return await snap.request({
        method: 'snap_notify',
        params: {
          type: 'inApp',
          message: `${safeAddress}`,
        },
      });
    }
    default:
      throw new Error('Method not found.');
  }
};

export const onCronjob: OnCronjobHandler = async ({ request }) => {
  switch (request.method) {
    case 'fireCronjob':
      const provider = await getProvider();
      const account = await getAccount();
      const signer = provider.getSigner(account);

      const getSignBody = {
        address: account,
      };

      // get sign from backend
      const signResponse = await fetch(
        'https://metamask-snaps.sdslabs.co/api/getSign',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(getSignBody),
        },
      );

      // Get JSON response
      try {
        const signResponseJson = await signResponse.json();

        const signature = await signer._signTypedData(
          signResponseJson.domainData,
          signResponseJson.type,
          signResponseJson.params,
        );
  
        if (signature) {
          const this_sign = processSign(account, signature, false);
  
          signResponseJson.signers.push(account);
          signResponseJson.signatures.push(this_sign);
          signResponseJson.currentThreshold += 1;
  
          const updateSignBody = {
            address: account,
            signData: signResponseJson,
            signedBy: signResponseJson.signers,
            currentThreshold: signResponseJson.currentThreshold,
          };
  
          // update sign in backend
          const updateResponse = await fetch(
            'https://metamask-snaps.sdslabs.co/api/updateSign',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updateSignBody),
            },
          );
  
          const getTransactionBody = {
            address: account,
          };
  
          // get transaction from backend
          const transactionResponse = await fetch(
            'https://metamask-snaps.sdslabs.co/api/getTransaction',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(getTransactionBody),
            },
          );
  
          try {
            const transactionResponseJson = await transactionResponse.json();
  
            const signArray = signResponseJson.signatures;
  
            const txnData = transactionResponseJson;
  
            const receipt = await executeTx(
              transactionResponseJson.safeAddress,
              signer,
              signArray,
              txnData,
            );
  
            if (receipt.status === 1) {
              const updateTransactionBody = {
                address: account,
                status: 'success',
              };
  
              // update transaction in backend
              const updateTransactionResponse = await fetch(
                'https://metamask-snaps.sdslabs.co/api/updateTransaction',
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(updateTransactionBody),
                },
              );
            }
          } catch (e) {
            console.log('Error : ', e);
            return;
          }
        }
      } catch (e) {
        return;
      }
      break;
    default:
      throw new Error('Method not found.');
  }
};