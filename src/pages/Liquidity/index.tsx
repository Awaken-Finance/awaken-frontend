import SettingFee from 'Buttons/SettingFeeBtn';
import Add from './components/Add';
import Remove from './components/Remove';
import { useTranslation } from 'react-i18next';
import { matchPath, useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import useCurrentPair from './useCurrentPair';
import { LoadPageLoading } from 'components/Loading';
import { PairInfo } from 'contexts/useModal/actions';
import { getCurrency } from 'utils/swap';
import useChainId from 'hooks/useChainId';
import CommonEmpty from 'components/CommonEmpty';
import { CommonPanelPage } from 'components/CommonPanelPage';
import './styles.less';

export default function ManageLiquidity() {
  const { t } = useTranslation();
  const history = useHistory();
  const { chainId } = useChainId();
  const { pathname } = useLocation();

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
    <CommonPanelPage
      className="manage-liquidity-page"
      title={title}
      onCancel={onCancel}
      extraTitle={<SettingFee className="manage-liquidity-setting" />}>
      {isAdd ? <Add pairInfo={pairInfo} /> : <Remove pairInfo={pairInfo} />}
    </CommonPanelPage>
  );
}
