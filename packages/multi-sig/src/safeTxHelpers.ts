import { ethers } from 'ethers';
import {
  safeAbi,
} from './abi';

const processSign = (signer_: string, data_: string, dynamic_: boolean) => {
  let safeSign = {
    signer: signer_,
    data: data_,
    dynamic: dynamic_
  }
  return safeSign;
}

export const calculateUnitAmt = (
  amountIn: any,
  decimalsIn: any,
  amountOut: any,
  decimalsOut: any,
  slippage: any,
) => {
  const resultantAmountOut = amountOut / 10 ** decimalsOut;
  const amountIn_ = amountIn / 10 ** decimalsIn;
  let unitAmt: any = resultantAmountOut / amountIn_;

  unitAmt *= (100 - slippage) / 100;
  unitAmt *= 10 ** 18;
  return unitAmt;
};

const buildSignatureBytes = (signatures: any) => {
  const signatureLengthBytes = 65;
  signatures.sort((left: any, right: any) => {
    left.signer.toLowerCase().localeCompare(right.signer.toLowerCase());
  });

  let signatureBytes = "0x";
  let dynamicBytes = "";
  for (const sig of signatures) {
    if (sig.dynamic) {
      const dynamicPartPosition = (
        signatures.length * signatureLengthBytes +
        dynamicBytes.length / 2
      )
        .toString(16)
        .padStart(64, "0");
      const dynamicPartLength = (sig.data.slice(2).length / 2)
        .toString(16)
        .padStart(64, "0");
      const staticSignature = `${sig.signer
        .slice(2)
        .padStart(64, "0")}${dynamicPartPosition}00`;
      const dynamicPartWithLength = `${dynamicPartLength}${sig.data.slice(2)}`;

      signatureBytes += staticSignature;
      dynamicBytes += dynamicPartWithLength;
    } else {
      signatureBytes += sig.data.slice(2);
    }
  }

  return signatureBytes + dynamicBytes;
};

const executeTx = async (safeAddr: any, owner:any,processed_sign_array: any, txData: any ) => {
  const safeInstance = new ethers.Contract(safeAddr, safeAbi, owner);
  const finalSigns = buildSignatureBytes(processed_sign_array);

  const tx =await safeInstance.connect(owner).execTransaction(
    txData.to,
    txData.value,
    "0x",
    0,
    0,
    0,
    0,
    "0x0000000000000000000000000000000000000000",
    "0x0000000000000000000000000000000000000000",
    finalSigns,
    {}
  )
  await tx.wait();
}

export const initiateTx = async (safeInstance: any, owner: any, toAddr: string, value: string, currentThreshold: number, account: string) => {
  // EIP712Domain(uint256 chainId,address verifyingContract)
  const domain = [
    { name: "chainId", type: "uint256" },
    { name: "verifyingContract", type: "address" },
  ];

  const types = {
    SafeTx: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "data", type: "bytes" },
      { name: "operation", type: "uint8" },
      { name: "safeTxGas", type: "uint256" },
      { name: "baseGas", type: "uint256" },
      { name: "gasPrice", type: "uint256" },
      { name: "gasToken", type: "address" },
      { name: "refundReceiver", type: "address" },
      { name: "nonce", type: "uint256" },
    ],
  };

  const domainData = {
    chainId: await safeInstance.connect(owner).getChainId(),
    verifyingContract: safeInstance.address,
  };

  const values = {
    to: toAddr,
    value: ethers.utils.parseUnits(value, 18),
    data: "0x",
    operation: 0,
    safeTxGas: 0,
    baseGas: 0,
    gasPrice: 0,
    gasToken: "0x0000000000000000000000000000000000000000",
    refundReceiver: "0x0000000000000000000000000000000000000000",
    nonce: await safeInstance.connect(owner).nonce(),
  };
  
  //sign the data with EIP 712 standard
  const signature = await owner._signTypedData(domainData, types, values);

  const signTxnData = {
    safeAddress: safeInstance.address,
    domainData: domainData,
    type: types,
    params: values,
    signers: [],
    signatures: [],
    currentThreshold: currentThreshold,
  }

  const executeTxData = {
    safeAddress: safeInstance.address,
    to: toAddr,
    value: ethers.utils.parseUnits(value, 18).toString(),
  }

  if (signature) {
    const thisSign = processSign(account, signature, false);

    signTxnData.signers.push(account);
    signTxnData.signatures.push(thisSign);
    currentThreshold = currentThreshold + 1;
    
  const signBody = {
    address: account,
    signData: JSON.stringify(signTxnData),
    signedBy: signTxnData.signers,
    currentThreshold: signTxnData.currentThreshold,
  }

  // send signTxnData to backend
  await fetch(
    'http://20.219.55.140:3000/api/sendSign',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signBody),
    },
  );

  const txnBody = {
    address: account,
    txnData: JSON.stringify(executeTxData),
  }

  // send txn to backend
  await fetch(
    'http://20.219.55.140:3000/api/sendTransaction',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(txnBody),
    },
  );

    if(currentThreshold === await safeInstance.connect(owner).getThreshold()){
      let signArray: any[] = [];
      let txnData: any;
      await executeTx(safeInstance, owner, signArray, txnData)
    }
  } else {
    console.log("Failed");
  }
  return signature;
};