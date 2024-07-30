import { TSwapRoute } from 'pages/Swap/types';
import './styles.less';
import Font from 'components/Font';
import { useMemo } from 'react';
import { TokenInfo } from 'types';
import { CurrencyLogo, CurrencyLogos } from 'components/CurrencyLogo';
import { useTranslation } from 'react-i18next';
import { ZERO } from 'constants/misc';
import { useMobile } from 'utils/isMobile';

export type TSwapOrderRoutingProps = {
  swapRoute?: TSwapRoute;
};

export const SwapOrderRouting = ({ swapRoute }: TSwapOrderRoutingProps) => {
  const isMobile = useMobile();
  const { t } = useTranslation();

  const routeList = useMemo(() => {
    if (!swapRoute) return [];
    return swapRoute.distributions.map((path) => {
      return {
        percent: path.percent,
        tokensList: path.tradePairs.map((item) => {
          return {
            tokens: [item.token0, item.token1],
            feeRate: `${ZERO.plus(item.feeRate).times(100).toFixed()}%`,
          };
        }),
      };
    });
  }, [swapRoute]);

  const firstToken = useMemo(() => {
    return swapRoute?.distributions[0]?.tokens[0];
  }, [swapRoute?.distributions]);

  const lastToken = useMemo(() => {
    const tokens = swapRoute?.distributions[0]?.tokens;
    return tokens?.[tokens?.length - 1];
  }, [swapRoute?.distributions]);

  // const feeRate = useMemo(() => {
  //   if (!route) return '-';
  //   return `${ZERO.plus(route.feeRate).times(100).toFixed()}%`;
  // }, [route]);

  if (!swapRoute) return <></>;
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
        {routeList.map((route, pathIdx) => (
          <div key={pathIdx} className="swap-order-route-wrap">
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

            <div className="swap-order-route-info swap-order-route-percent">
              <Font size={12} lineHeight={14}>{`${route.percent}%`}</Font>
            </div>

            <div className="swap-order-route-content">
              {route.tokensList.map((item, idx) => (
                <div className="swap-order-route-info" key={idx}>
                  <CurrencyLogos size={16} tokens={item.tokens} isSortToken={false} />
                  <Font size={12} lineHeight={14}>
                    {item.feeRate}
                  </Font>
                </div>
              ))}
            </div>

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
        ))}
      </div>
    </div>
  );
};
