import { Currency } from '@awaken/sdk-core';
import AuthBtn from 'Buttons/AuthBtn';
import { useAsyncEffect } from 'ahooks';
import BigNumber from 'bignumber.js';
import { CommonButtonProps } from 'components/CommonButton';
import useAllowanceAndApprove from 'hooks/useApprove';
import { useEffect, useMemo } from 'react';
import { divDecimals, timesDecimals } from 'utils/calculate';
import { useTranslation } from 'react-i18next';
import { formatSymbol } from 'utils/token';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

export type ApproveBtnProps = Omit<CommonButtonProps, 'onClick'> & {
  symbol?: string;
  token?: Currency;
  tokenContractAddress?: string;
  approveTargetAddress?: string;
  approveBN: BigNumber;
  approveInput: string;
  onApproveStateChange: (approved: boolean, hasQueryToken: boolean) => void;
  onAllowanceChange: (allowance: number, approveRequired: boolean) => void;
};

export default function ApproveBtn({
  symbol,
  token,
  tokenContractAddress,
  approveTargetAddress,
  approveInput,
  approveBN,
  onApproveStateChange,
  onAllowanceChange,
  ...props
}: ApproveBtnProps) {
  const { walletInfo } = useConnectWallet();
  const { t } = useTranslation();
  const { approving, checkAllowance, allowance, tokenInfo, approve, checkingAllowance } = useAllowanceAndApprove(
    tokenContractAddress,
    symbol,
    walletInfo?.address,
    approveTargetAddress || tokenContractAddress,
  );

  const allowanceBN = useMemo(() => {
    return divDecimals(new BigNumber(allowance), token?.decimals);
  }, [token, allowance]);

  const onClickApprove = async () => {
    try {
      const newAllowance = await checkAllowance();
      const newAllowanceBN = divDecimals(new BigNumber(newAllowance), token?.decimals);
      if (approveBN.isGreaterThan(newAllowanceBN)) {
        await approve(timesDecimals(approveBN, token?.decimals));
      }
    } catch (error: any) {
      console.error(error);
    }
  };
  const hasQueryToken = useMemo(() => {
    return !!tokenInfo;
  }, [tokenInfo]);

  const approved = useMemo(() => {
    if (approveBN.eq(0)) return false;
    return approveBN.isLessThanOrEqualTo(allowanceBN);
  }, [allowanceBN, approveBN]);

  const buttonText = useMemo(() => {
    if (!symbol) return 'Approve';
    if (!tokenContractAddress) return 'Approve';
    if (approveBN.isGreaterThan(allowanceBN)) {
      return 'Approve';
    }
    if (approveBN.isNaN()) {
      return 'Approve';
    }
    if (approveBN.eq(0)) {
      return 'Approve';
    }
    return 'Approved';
  }, [allowanceBN, approveBN, symbol, tokenContractAddress]);

  const buttonDisabled = useMemo(() => {
    return (
      approved || !symbol || !tokenContractAddress || approveBN.isNaN() || approveBN.isLessThanOrEqualTo(0) || !token
    );
  }, [approveBN, approved, symbol, token, tokenContractAddress]);

  useEffect(() => {
    onApproveStateChange(approved, hasQueryToken);
  }, [approved, hasQueryToken, onApproveStateChange]);

  useAsyncEffect(async () => {
    await checkAllowance();
  }, [approveInput, tokenContractAddress, approveTargetAddress]);

  useEffect(() => {
    const newAllowanceBN = divDecimals(new BigNumber(allowance), token?.decimals);
    const approveRequired = approveBN.isGreaterThan(newAllowanceBN);
    onAllowanceChange(allowance, approveRequired);
  }, [allowance, approveBN, onAllowanceChange, token?.decimals]);

  return (
    <AuthBtn {...props} disabled={buttonDisabled} loading={approving || checkingAllowance} onClick={onClickApprove}>
      {`${t(buttonText)} ${formatSymbol(symbol)}`}
    </AuthBtn>
  );
}
