import {  OnTransactionHandler } from '@metamask/snap-types';
import { hasProperty, isObject, remove0x } from '@metamask/utils';

export const onTransaction: any = async ({ transaction }) => {
  // Check transaction type
  if (
    !isObject(transaction) ||
    !hasProperty(transaction, 'data') ||
    typeof transaction.data !== 'string'
  ) {
    return {
      type: 'Unknown transaction',
    };
  }

  if (transaction.data == null) {
    console.log("Transaction Data is NULL");
  }

  // Getting the function signature
  const data = transaction.data.split('0x')[1];
  console.log('superman3', data);

  const transactionData = data.split('0x')[0];
  const functionSignature = transactionData.slice(0, 8);

  // Fetching the response for contract details
  const info = await fetch(
    `http://localhost:7777/description?contract_addr=${transaction.to}&four_byte=${functionSignature}`,
  );
  
  // Parsing the response
  const ret = await info.json();

  return {
    insights: ret,
  };
};
