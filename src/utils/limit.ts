import { Currency } from '@awaken/sdk-core';
import { ContractInterface } from './contract';
import { divDecimals } from './calculate';
import BigNumber from 'bignumber.js';
import { PBTimestamp } from 'types/aelf';
import { formatLimitError } from './formatError';
import { isUserDenied } from 'utils';
import { REQ_CODE } from 'constants/misc';
import notification from './notification';
import { TFunction } from 'react-i18next';
import getTransactionId from './contractResult';

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

export const getContractMaxPrice = async (params: TGetContractReversesParams) => {
  const reverses = await getContractReverses(params);
  const { tokenIn, tokenOut } = params;
  const prices = reverses.map((item) =>
    divDecimals(item.reverseIn, tokenIn.decimals).div(divDecimals(item.reverseOut, tokenOut.decimals)).toFixed(),
  );
  return BigNumber.max(...prices).toFixed();
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
