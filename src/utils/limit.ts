import { Currency } from '@awaken/sdk-core';
import { ContractInterface } from './contract';
import { divDecimals } from './calculate';
import BigNumber from 'bignumber.js';
import { formatLimitError } from './formatError';
import { isUserDenied } from 'utils';
import { REQ_CODE, ZERO } from 'constants/misc';
import notification from './notification';
import { TFunction } from 'react-i18next';
import getTransactionId from './contractResult';
import { TLimitRecordItem } from 'types/transactions';
import { LIMIT_MAX_BUFFER_RATIO, LIMIT_PRICE_DECIMAL } from 'constants/limit';

export type TGetContractReversesParams = {
  contract: ContractInterface;
  tokenIn: Currency;
  tokenOut: Currency;
};
export type TContractReverseItem = {
  feeRate: string;
  reverseA: string;
  reverseB: string;
  symbolA: string;
  symbolB: string;
};
export type TReverseItem = {
  reverseIn: string;
  reverseOut: string;
};

export const getContractReverses = async ({
  contract,
  tokenIn,
  tokenOut,
}: TGetContractReversesParams): Promise<TReverseItem[]> => {
  const result = await contract.callViewMethod('GetAllReverse', {
    symbolA: tokenIn.symbol,
    symbolB: tokenOut.symbol,
  });
  if (!result.reverses || result.reverses.length === 0) throw new Error('getContractReverses: no reverse');
  return result.reverses.map((item: TContractReverseItem) => {
    if (item.symbolA === tokenIn.symbol)
      return {
        reverseIn: item.reverseA,
        reverseOut: item.reverseB,
      };
    return {
      reverseIn: item.reverseB,
      reverseOut: item.reverseA,
    };
  });
};

export const getContractMaxBufferPrice = async (params: TGetContractReversesParams) => {
  const { tokenIn, tokenOut } = params;
  const reverses = await getContractReverses(params);
  let maxReserveProduct = ZERO;
  let maxReverse: TReverseItem | undefined;
  reverses.forEach((item) => {
    const reserveProduct = ZERO.plus(item.reverseIn).times(item.reverseOut);
    if (reserveProduct.lte(maxReserveProduct)) return;
    maxReserveProduct = reserveProduct;
    maxReverse = item;
  });

  if (!maxReverse) throw new Error('getContractMaxBufferPrice error');
  return divDecimals(maxReverse.reverseIn, tokenIn.decimals)
    .div(divDecimals(maxReverse.reverseOut, tokenOut.decimals))
    .times(LIMIT_MAX_BUFFER_RATIO)
    .dp(LIMIT_PRICE_DECIMAL, BigNumber.ROUND_DOWN)
    .toFixed();
};

export type TCommitLimitParams = {
  contract: ContractInterface;
  account: string;
  args: {
    amountIn: string;
    symbolIn: string;
    amountOut: string;
    symbolOut: string;
    deadline:
      | number
      | {
          seconds: number;
          nanos: number;
        };
  };
  t: TFunction<'translation'>;
};
export const commitLimit = async ({ contract, account, args, t }: TCommitLimitParams) => {
  try {
    const result = await contract.callSendMethod('CommitLimitOrder', account, args, { onMethod: 'receipt' });
    console.log('commitLimit result', result);

    if (result.error) {
      console.log('commitLimit error', result);

      formatLimitError(result.error);
      if (isUserDenied(result.error.message)) return REQ_CODE.UserDenied;
      return REQ_CODE.Fail;
    }
    const transactionId = getTransactionId(result);
    notification.successToExplorer(
      {
        message: t('Limit submitted'),
        txId: transactionId,
      },
      t,
    );
    return REQ_CODE.Success;
  } catch (error) {
    console.log('commitLimit error', error);
    formatLimitError(error);
    return REQ_CODE.Fail;
  }
};

export type TCancelLimitParams = {
  contract: ContractInterface;
  account: string;
  args: {
    orderId: number;
  };
  t: TFunction<'translation'>;
};
export const cancelLimit = async ({ contract, account, args, t }: TCancelLimitParams) => {
  try {
    const result = await contract.callSendMethod('CancelLimitOrder', account, args, { onMethod: 'receipt' });
    console.log('cancelLimit result', result);

    if (result.error) {
      console.log('cancelLimit error', result);

      formatLimitError(result.error);
      if (isUserDenied(result.error.message)) return REQ_CODE.UserDenied;
      return REQ_CODE.Fail;
    }
    const transactionId = getTransactionId(result);
    notification.successToExplorer(
      {
        message: t('Cancellation Successful'),
        txId: transactionId,
      },
      t,
    );
    return REQ_CODE.Success;
  } catch (error) {
    console.log('commitLimit error', error);
    formatLimitError(error);
    return REQ_CODE.Fail;
  }
};

export const getLimitOrderPrice = (record: TLimitRecordItem) => {
  return ZERO.plus(record.amountOut).div(record.amountIn);
};
