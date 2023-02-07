import { OnTransactionHandler, OnRpcRequestHandler } from '@metamask/snaps-types';
import { text } from '@metamask/snaps-ui';
import { hasProperty, isObject, Json, JsonSize } from '@metamask/utils';

export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  // Check transaction type
  if (
    !isObject(transaction) ||
    !hasProperty(transaction, 'data') ||
    typeof transaction.data !== 'string'
  ) {
    console.warn('Unknown transaction type.');
    return { content: text('Unknown transaction') };
  }

  // body sent to Tenderly API
  const body:JSON = <JSON><unknown>{
    "network_id": "5",
    "from": transaction.from,
    "to": transaction.to,
    "input": transaction.data,
    "gas": parseInt(transaction.gas as string, 16),
    "gas_price": "0",
    "value": transaction.value,
    "save_if_fails": true
  };

  // Header , API key : for demo purpose
  const headers = {
    'content-type': 'application/json',
    'X-Access-Key': 'FEBcxLzvN-9L3hgDfCnzvjnjFieJS-oL',
  };

  // Fetching the response from Tenderly API
  const response = await fetch("https://api.tenderly.co/api/v1/account/me/project/project/simulate", {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  // Parsing the response
  const data = await response.json();
  var retVal;

  // returning the response
  if(response.status !== 200) {
    retVal = {error: data.error.message};
    return {insights: retVal};
  } else {
    retVal = {
      Status : data.transaction.status,
      From : data.transaction.transaction_info.call_trace.from,
      From_Balance : data.transaction.transaction_info.call_trace.from_balance,
      To : data.transaction.transaction_info.call_trace.to,
      To_Balance : data.transaction.transaction_info.call_trace.to_balance,
      Value : data.transaction.transaction_info.call_trace.value,
      Gas_Limit : data.transaction.gas,
      Gas_Used : data.transaction.gas_used,
    }
    return {insights: retVal};
  };
}
           
