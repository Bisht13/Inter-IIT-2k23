import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { ethers, Wallet } from 'ethers';
import { abi } from "./abi";

  /* Mapping
  *  USDC : 1 : 0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557
  *  USDT : 2 : 0x509Ee0d083DdF8AC028f2a56731412edD63223B9
  *  DAI  : 3 : 0x73967c6a0904aA032C103b4104747E88c566B1A2
  *  UNI  : 4 : 0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984
  *  WETH : 5 : 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6
  *  COMP : 6 : 0xc00e94Cb662C3520282E6f5717214004A7f26888
  *  LINK : 7 : 0x63bfb2118771bd0da7A6936667A7BB705A06c1bA
  *  WBTC : 8 : 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599
  *  MKR  : 9 : 0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2
  */

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

const tokenAddress : string[] = [
    "0x2f3a40a3db8a7e3d09b0adfefbce4f6f81927557",
    "0x509ee0d083ddf8ac028f2a56731412edd63223b9",
    "0x73967c6a0904aa032c103b4104747e88c566b1a2",
    "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
    "0xc00e94cb662c3520282e6f5717214004a7f26888",
    "0x63bfb2118771bd0da7a6936667a7bb705a06c1ba",
    "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
];


export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  /* Creating the State to Store the data of Approved tokens */
  let state = (await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  })) as { testState: [string, Array<string>][] } | null;
  if (!state) {
    state = { testState: [] };
    await snap.request({
      method: 'snap_manageState',
      params: { operation: 'update', newState: state },
    });
  }
  /* Initialising the [string, Array<string>][] */
 if(state.testState.length === 0) {
  state.testState.push(["USDC", []])
  state.testState.push(["USDT", []])
  state.testState.push(["DAI", []])
  state.testState.push(["UNI", []])
  state.testState.push(["WETH", []])
  state.testState.push(["COMP", []])
  state.testState.push(["LINK", []])
  state.testState.push(["WBTC", []])
  state.testState.push(["MKR", []])
 }

 const address = await getAccount();

  switch (request.method) {
    case 'changeAllowance':
      try {
        // requesting data from Etherscan API for transaction history
        let retVal = await fetch(`http://20.219.55.140:3000/api/getTransactionHistory?address=${address}`).then((response) => {
          return response.json()
        })

        let update = false;
        // adding unique tokens to the state
        retVal.forEach((element) => {
          try{
            let index = tokenAddress.indexOf(element[0])
            if(state.testState[index].indexOf(element[1]) === -1) {
              state.testState[index].push(element[1])
              update = true;
            }
          } catch(e) {
            console.log("Error in accessing state : ", e)
          }
        })
        // updating the state
        if(update) {
          await snap.request({
            method: 'snap_manageState',
            params: { operation: 'update', newState: state },
          });
        }

        update = false;
        return true;
      } catch(e) {
        console.log("Error in fetching data : ", e)
      }
    case 'retrieveTestData':
      return await snap.request({
        method: 'snap_manageState',
        params: { operation: 'get' },
      });
    case 'clearTestData':
      await snap.request({
        method: 'snap_manageState',
        params: { operation: 'clear' },
      });
      return true;
    case 'revoke':
      const params = request.params as string[];
      const provider = await getProvider();
      const owner = provider.getSigner(address);

      const acontract = new ethers.Contract(
        params[0], // address of contract
        abi,
        owner,
      );

      const aa = await acontract.approve(
        params[1], // spender
        0, // amount = 0 for revoking approval
      );

      const tx = await aa.wait();

      console.log("Status : ", tx.status)

      // check for valid transaction
      if (tx.status === 1) {
        return snap.request({
          method: 'snap_confirm',
          params: [
            {
              prompt: 'Success!',
              description: 'Revoked Approval',
              textAreaContent: params[0],
            },
          ],
        });
      }
      else {
        return snap.request({
          method: 'snap_confirm',
          params: [
            {
              prompt: 'Error!',
              description: 'Failed to Revoke Approval',
              textAreaContent: params[0],
            },
          ],
        });
      }
    default:
      throw new Error('Method not found.');
  }
};
