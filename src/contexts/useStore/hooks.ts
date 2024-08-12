import { useMemo } from 'react';
import { useStore } from '.';
import { ZERO } from 'constants/misc';
import { divDecimals } from 'utils/calculate';
export function useBlockHeight() {
  const [{ blockHeight }] = useStore();
  return useMemo(() => blockHeight, [blockHeight]);
}

export const useTransactionFee = () => {
  const [{ transactionFee }] = useStore();
  return useMemo(() => transactionFee, [transactionFee]);
};

export const useTransactionFeeBN = () => {
  const [{ transactionFee }] = useStore();
  return useMemo(() => ZERO.plus(transactionFee), [transactionFee]);
};

export const useTransactionFeeStr = () => {
  const [{ transactionFee }] = useStore();
  return useMemo(() => divDecimals(ZERO.plus(transactionFee), 8).toFixed(), [transactionFee]);
};
