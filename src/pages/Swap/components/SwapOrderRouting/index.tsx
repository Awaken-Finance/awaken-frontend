import { TPairRoute } from 'pages/Swap/types';
import './styles.less';
import Font from 'components/Font';
import { useMemo } from 'react';
import { TokenInfo } from 'types';
import { CurrencyLogo, CurrencyLogos } from 'components/CurrencyLogo';
import { useTranslation } from 'react-i18next';
import { ZERO } from 'constants/misc';
import { useMobile } from 'utils/isMobile';

export type TSwapOrderRoutingProps = {
  route?: TPairRoute;
};

export const SwapOrderRouting = ({ route }: TSwapOrderRoutingProps) => {
  const isMobile = useMobile();
  const { t } = useTranslation();
  const tokenList = useMemo(() => {
    if (!route) return [];
    const _list: Array<TokenInfo[]> = [];
    const rawPath = route.rawPath;
    for (let i = 0; i < rawPath.length - 1; i++) {
      _list.push([rawPath[i], rawPath[i + 1]]);
    }
    return _list;
  }, [route]);

  const firstToken = useMemo(() => {
    return route?.rawPath?.[0];
  }, [route?.rawPath]);

  const lastToken = useMemo(() => {
    return route?.rawPath?.[route?.rawPath?.length - 1];
  }, [route?.rawPath]);

  const feeRate = useMemo(() => {
    if (!route) return '-';
    return `${ZERO.plus(route.feeRate).times(100).toFixed()}%`;
  }, [route]);

  if (!route) return <></>;
  return (
    <div className="swap-order-routing">
      {!isMobile && (
        <div className="swap-order-header">
          <Font size={12} lineHeight={14}>
            {t('Order Routing')}
          </Font>
        </div>
      )}

      <div className="swap-order-content">
        {firstToken && (
          <div className="swap-order-token-icon">
            <CurrencyLogo
              size={16}
              address={firstToken.address}
              symbol={firstToken.symbol}
              className={'swap-order-token-icon'}
            />
          </div>
        )}

        {tokenList.map((item, idx) => (
          <div className="swap-order-route-info" key={idx}>
            <CurrencyLogos size={16} tokens={item} isSortToken={false} />
            <Font size={12} lineHeight={14}>
              {feeRate}
            </Font>
          </div>
        ))}

        {lastToken && (
          <div className="swap-order-token-icon">
            <CurrencyLogo
              size={16}
              address={lastToken.address}
              symbol={lastToken.symbol}
              className={'swap-order-token-icon'}
            />
          </div>
        )}

        <div className="swap-order-dot-line"></div>
      </div>
    </div>
  );
};
