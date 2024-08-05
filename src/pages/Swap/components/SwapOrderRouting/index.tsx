import { TPercentInfo, TSwapRoute } from 'pages/Swap/types';
import './styles.less';
import Font from 'components/Font';
import { useMemo } from 'react';
import { CurrencyLogo, CurrencyLogos } from 'components/CurrencyLogo';
import { useTranslation } from 'react-i18next';
import { ZERO } from 'constants/misc';
import { useMobile } from 'utils/isMobile';

export type TSwapOrderRoutingProps = {
  swapRoute?: TSwapRoute;
  percentRoutes?: TPercentInfo[];
};

export const SwapOrderRouting = ({ swapRoute, percentRoutes }: TSwapOrderRoutingProps) => {
  const isMobile = useMobile();
  const { t } = useTranslation();
  console.log('percentRoutes', percentRoutes);

  const routeList = useMemo(() => {
    if (swapRoute) {
      return swapRoute.distributions.map((path) => {
        return {
          percent: path.percent,
          tokensList: path.tradePairs.map((item, idx) => {
            return {
              tokens: [path.tokens[idx], path.tokens[idx + 1]],
              feeRate: `${ZERO.plus(item.feeRate).times(100).toFixed()}%`,
            };
          }),
        };
      });
    }
    if (percentRoutes) {
      return percentRoutes.map((path) => {
        return {
          percent: path.percent,
          tokensList: path.route.map((item) => {
            let tokenIn = item.tradePair?.token0;
            let tokenOut = item.tradePair?.token1;
            if (item.tradePair?.token0.symbol === item.symbolOut) {
              tokenIn = item.tradePair?.token1;
              tokenOut = item.tradePair?.token0;
            }

            return {
              tokens: [tokenIn, tokenOut],
              feeRate: `${ZERO.plus(item.tradePair?.feeRate).times(100).toFixed()}%`,
            };
          }),
        };
      });
    }
    return [];
  }, [swapRoute, percentRoutes]);

  console.log('routeList', routeList);

  const firstToken = useMemo(() => {
    if (swapRoute) return swapRoute?.distributions[0]?.tokens[0];
    if (percentRoutes) {
      const route = percentRoutes[0]?.route?.[0];
      if (!route) return;
      let tokenIn = route.tradePair?.token0;
      if (route.tradePair?.token0.symbol === route.symbolOut) {
        tokenIn = route.tradePair?.token1;
      }
      return tokenIn;
    }
  }, [percentRoutes, swapRoute]);

  const lastToken = useMemo(() => {
    if (swapRoute) {
      const tokens = swapRoute?.distributions[0]?.tokens;
      return tokens?.[tokens?.length - 1];
    }
    if (percentRoutes) {
      const path = percentRoutes[0]?.route;
      if (!path) return;
      const route = path[path.length - 1];
      if (!route) return;
      let tokenOut = route.tradePair?.token1;
      if (route.tradePair?.token0.symbol === route.symbolOut) {
        tokenOut = route.tradePair?.token0;
      }
      return tokenOut;
    }
  }, [percentRoutes, swapRoute]);

  if (!swapRoute && !percentRoutes) return <></>;
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
