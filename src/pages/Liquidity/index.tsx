import SettingFee from 'Buttons/SettingFeeBtn';
import Add from 'Modals/ManageLiquidityModal/Add';
import Remove from 'Modals/ManageLiquidityModal/Remove';
import CommonModal from 'components/CommonModal';
import Font from 'components/Font';
import { useTranslation } from 'react-i18next';
import '../../Modals/ManageLiquidityModal/styles.less';
import { matchPath, useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import useCurrentPair from './useCurrentPair';
import { LoadPageLoading } from 'components/Loading';
import { PairInfo } from 'contexts/useModal/actions';
import { getCurrency } from 'utils/swap';
import useChainId from 'hooks/useChainId';
import CommonEmpty from 'components/CommonEmpty';
import { useMobile } from 'utils/isMobile';

export default function ManageLiquidity() {
  const { t } = useTranslation();
  const history = useHistory();
  const { chainId } = useChainId();
  const { pathname } = useLocation();
  const isMobile = useMobile();

  const match = useRouteMatch<{ pair: string }>('/liquidity/:pair/:action');
  const { pair } = match?.params || {};

  const { pairItem, isLoading, error } = useCurrentPair(pair || '', chainId);

  const pairInfo = useMemo<PairInfo | undefined>(() => {
    if (!pairItem) return undefined;
    return {
      tokenA: getCurrency(pairItem.token0, chainId),
      tokenB: getCurrency(pairItem.token1, chainId),
      feeRate: pairItem.feeRate.toString(),
    };
  }, [chainId, pairItem]);

  const isAdd = useMemo(() => {
    return matchPath(pathname, {
      path: `/liquidity/:pair/add`,
      exact: true,
      strict: false,
    });
  }, [pathname]);

  const title = useMemo(() => {
    return t(isAdd ? 'addLiquidity' : 'removeLiquidity');
  }, [isAdd, t]);

  const height = useMemo(() => {
    if (!isMobile) return '654px';
    return 'calc(100% - 48px)';
  }, [isMobile]);

  const onCancel = useCallback(() => {
    history.go(-1);
  }, [history]);

  if (isLoading) {
    return <LoadPageLoading type="page" />;
  }

  if (error) {
    return <CommonEmpty type="nodata" desc={error.message} />;
  }

  if (!pairInfo) {
    return <CommonEmpty type="nodata" />;
  }

  return (
    <CommonModal
      height={height}
      visible={true}
      closable={false}
      mask={false}
      maskClosable={false}
      zIndex={20}
      transitionName="custom"
      wrapClassName="manage-liquidity-modal-wrap"
      title={
        <>
          <Font size={16} weight="medium">
            {title}
          </Font>
          <SettingFee className="manage-liquidity-setting" />
        </>
      }
      onCancel={onCancel}>
      {isAdd ? <Add pairInfo={pairInfo} /> : <Remove pairInfo={pairInfo} />}
    </CommonModal>
  );
}
