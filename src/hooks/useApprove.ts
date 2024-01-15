import { useEffect, useRef, useState } from 'react';
import { useAElfContract } from './useContract';
import { ZERO } from 'constants/misc';
import { getTxResult } from 'utils/aelfUtils';
import BigNumber from 'bignumber.js';
import { formatApproveError } from 'utils/formatError';
import { sleep } from 'utils';

export default function useAllowanceAndApprove(
  contractAddress?: string,
  symbol?: string,
  account?: string,
  approveTargetAddress?: string,
) {
  const contract = useAElfContract(contractAddress);
  const destroyedRef = useRef(false);
  const [checkingAllowance, setCheckingAllowance] = useState(false);
  const [approving, setApproving] = useState(false);
  const [allowance, setAllowance] = useState(0);
  const [tokenInfo, setTokenInfo] = useState(undefined);

  useEffect(() => {
    destroyedRef.current = false;
    return () => {
      destroyedRef.current = true;
    };
  }, []);

  useEffect(() => {
    setAllowance(0);
    setTokenInfo(undefined);
  }, [contractAddress, symbol, approveTargetAddress]);

  const checkAllowance = async () => {
    if (!symbol) return 0;
    if (!contract) {
      setAllowance(0);
      setTokenInfo(undefined);
      return 0;
    }
    setCheckingAllowance(true);
    try {
      const [allowance, info] = await Promise.all([
        contract.callViewMethod('GetAllowance', [symbol, account, approveTargetAddress || contractAddress]),
        contract.callViewMethod('GetTokenInfo', [symbol]),
      ]);
      if (destroyedRef.current) return ZERO;

      if (allowance.error) {
        throw allowance.error;
      }

      let allowanceResult = 0;
      if (allowance.allowance != undefined) {
        allowanceResult = allowance.allowance;
      } else {
        allowanceResult = allowance.amount || 0;
      }

      setAllowance(allowanceResult);
      setTokenInfo(info);
      return allowanceResult;
    } finally {
      setCheckingAllowance(false);
    }
  };

  const approve = async (approveAmount: BigNumber) => {
    if (!account) return;
    if (!contract) return;
    setApproving(true);
    try {
      const approveResult = await contract.callSendMethod(
        'approve',
        account,
        [approveTargetAddress || contractAddress, symbol, approveAmount.toString()],
        {
          onMethod: 'receipt',
        },
      );

      if (approveResult.error) {
        throw approveResult.error;
      }

      await sleep(1000);

      await getTxResult(approveResult?.transactionId);

      await checkAllowance();

      return approveResult;
    } catch (error: any) {
      formatApproveError(error);
      throw error;
    } finally {
      setApproving(false);
    }
  };

  return {
    checkingAllowance,
    approving,
    allowance,
    tokenInfo,
    checkAllowance,
    approve,
  };
}
