import React, { useMemo, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { TokenInfo } from 'types/index';
import CommonButton from 'components/CommonButton';
import Font from 'components/Font';
import { useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';

import './index.less';

interface SwapBtntnProps {
  children?: React.ReactChild;
  token0: TokenInfo;
  token1: TokenInfo;
  feeRate: number;
  id: string;
  useBtn?: boolean;
}

export const useGoSwapPage = () => {
  const history = useHistory();

  return useCallback(
    ({ token0, token1, feeRate }: { token0?: TokenInfo; token1?: TokenInfo; feeRate?: number }) => {
      return history.push({
        pathname: `/trading/${token0?.symbol}_${token1?.symbol}_${new BigNumber(feeRate ?? 0).times(100)}`,
      });
    },
    [history],
  );
};

export default function SwapBtn({ children, useBtn = false, token0, token1, feeRate }: SwapBtntnProps) {
  const { t } = useTranslation();
  const callback = useGoSwapPage();

  const renderContent = useMemo(() => {
    if (children) {
      return children;
    }

    if (useBtn) {
      return (
        <CommonButton type="primary">
          <Font weight="medium" size={16}>
            {t('tradingSwap')}
          </Font>
        </CommonButton>
      );
    }

    return (
      <Font lineHeight={20} color="primary" className="font-swap">
        {t('tradingSwap')}
      </Font>
    );
  }, [children, useBtn, t]);

  return <div onClick={() => callback({ token0, token1, feeRate })}>{renderContent}</div>;
}
