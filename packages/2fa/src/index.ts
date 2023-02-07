import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text, heading } from '@metamask/snaps-ui';
import { JsonSLIP10Node, SLIP10Node } from '@metamask/key-tree';
import { base32 } from 'rfc4648';
import * as speakeasy from 'speakeasy';
import { ethers } from 'ethers';

interface GetAccountParams {
  path: string;
  curve?: 'secp256k1' | 'ed25519';

  [key: string]: unknown;
}

const getSLIP10Node = async (params: GetAccountParams): Promise<SLIP10Node> => {
  const json = (await snap.request({
    method: 'snap_getBip32Entropy',
    params,
  })) as JsonSLIP10Node;

  return SLIP10Node.fromJSON(json);
};

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

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'dialogConf':
      request.params = {
        path: ['m', "44'", "0'"],
        curve: 'secp256k1',
      };
      const params = request.params as GetAccountParams;
      const node = await getSLIP10Node(params);
      const key = node.privateKey;
      // Base32 (RFC 3548, RFC 4648) encode the key
      const setupKeyBase32 = base32.stringify(key).replace(/=+$/, '');
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'Alert',
          fields: {
            title: '2FA Setup',
            description: `Here is your 2FA setup key. Please save it in a safe place. You will need it to log in to your account.`,
            textAreaContent: setupKeyBase32,
          },
        },
      });
    case 'dialogPrompt': {
      request.params = {
        path: ['m', "44'", "0'"],
        curve: 'secp256k1',
      };
      const paramsNode = request.params as GetAccountParams;
      const node_ = await getSLIP10Node(paramsNode);
      const key_ = node_.privateKey;
      // Base32 (RFC 3548, RFC 4648) encode the key
      const setupKeyBase32_ = base32.stringify(key_).replace(/=+$/, '');

      console.log('setup key : ', setupKeyBase32_);

      let code = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'Prompt',
          fields: {
            title: '2 Factor Authentication Code',
            description: 'Enter your 2FA code here',
            placeholder: '2FA Code',
          },
        },
      });

      console.log('code : ', code);

      var verified = false;

      try {
        verified = speakeasy.totp.verify({
          secret: setupKeyBase32_,
          encoding: 'base32',
          token: code as string,
        });
      }
      catch (e) {
        console.log('ZAMN : ', e);
      }

      if (verified) {
        console.log('verified with code : ', code);
      
        let to = await snap.request({
          method: 'snap_dialog',
          params: {
            type: 'Prompt',
            fields: {
              title: 'To',
              description: 'Enter the address you want to send to',
              placeholder: 'To',
            }
          }});

          let value = await snap.request({
            method: 'snap_dialog',
            params: {
              type: 'Prompt',
              fields: {
                title: 'Value',
                description: 'Enter the value you want to send',
                placeholder: 'Value',
              },
            }
          });

        // Create a transaction
        const txParams = {
          to: to as string,
          value: ethers.utils.parseUnits(value as string, 'ether'),
        };
        // Send the transaction
        const account = await getAccount();
        const provider = await getProvider();
        const signer = provider.getSigner(account);
        const tx = await signer.sendTransaction(txParams);
        await tx.wait(1);
        console.log('tx : ', tx);
        return true;
      } else {
        return await snap.request({
          method: 'snap_dialog',
          params: {
            type: 'Alert',
            fields: {
              title: '2FA Error',
              description: 'Invalid 2FA code',
            },
          },
        });
      }
      break;
    }
    default:
      console.log("Error")
  }
};
