import { OnTransactionHandler, OnRpcRequestHandler } from '@metamask/snaps-types';
import { text } from '@metamask/snaps-ui';
import { hasProperty, isObject } from '@metamask/utils';


/**
 * Handle an incoming transaction, and return any insights.
 *
 * @param args - The request handler args as object.
 * @param args.transaction - The transaction object.
 * @returns The transaction insights.
 */
export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  console.log('create 1')
  let x = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'Alert',
      fields: {
        title: 'Staking',
        description: 'You are currently staking 0.001 ETH every 5 minutes',
      }
    },
  });

  console.log('create 2')

  if (
    !isObject(transaction) ||
    !hasProperty(transaction, 'data') ||
    typeof transaction.data !== 'string'
  ) {
    console.warn('Unknown transaction type.');
    return { content: text('Unknown transaction') };
  }

  return { content: text('Unknown transaction') };

};
