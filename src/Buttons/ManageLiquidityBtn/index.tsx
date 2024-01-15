import React, { MouseEvent, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMobile } from 'utils/isMobile';

import CommonButton from 'components/CommonButton';
import Font from 'components/Font';
import useLoginCheck from 'hooks/useLoginCheck';
import { useHistory } from 'react-router-dom';

import './index.less';
import { PairItem, PoolItem } from 'types';
import BigNumber from 'bignumber.js';

interface ManageLiquidityBtnProps {
  children?: React.ReactChild | null;
  pair: PairItem | PoolItem;
  useBtn?: boolean;
  lpType?: 'add' | 'remove';
  btnText?: string;
}

export default function ManageLiquidityBtn({
  children,
  pair,
  useBtn = false,
  lpType = 'add',
  btnText,
}: ManageLiquidityBtnProps) {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const history = useHistory();

  const pairInfoStr = `${pair.token0?.symbol}_${pair.token1?.symbol}_${new BigNumber(pair.feeRate ?? 0).times(100)}`;

  const routePath = `/liquidity/${pairInfoStr}/${lpType}`;

  const gotoManageLiquidity = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      history.push(routePath);
    },
    [history, routePath],
  );

  const onClick = useLoginCheck(
    {
      checkAccountSync: true,
      redirect: routePath,
    },
    gotoManageLiquidity,
  );

  const renderContent = useMemo(() => {
    if (children) {
      return children;
    }

    let btnTxt;

    if (btnText) {
      btnTxt = btnText;
    } else {
      btnTxt = lpType === 'add' ? 'addLiquidity' : 'removeLiquidity';
    }

    if (useBtn) {
      if (isMobile) {
        return (
          <CommonButton type="primary" size="small">
            <Font size={14} weight="medium">
              {t(btnTxt)}
            </Font>
          </CommonButton>
        );
      }
      return (
        <CommonButton type="primary">
          <Font size={16} weight="medium">
            {t(btnTxt)}
          </Font>
        </CommonButton>
      );
    }

    return (
      <Font lineHeight={20} color="primary" className="manage-liquidity-btn">
        {t(btnTxt)}
      </Font>
    );
  }, [children, useBtn, t, isMobile, lpType, btnText]);

  return <div onClick={onClick}>{renderContent}</div>;
}
