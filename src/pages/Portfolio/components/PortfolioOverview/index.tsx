import Font from 'components/Font';
import { useTranslation } from 'react-i18next';

import './styles.less';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useActiveWeb3React } from 'hooks/web3';
import { useReturnLastCallback } from 'hooks';
import PriceUSDDigits from 'components/PriceUSDDigits';
import getFontStyle from 'utils/getFontStyle';
import { TAssetPortfolio, TIdleTokenInfo } from 'types/portfolio';
import { getAssetPortfolioApi, getIdleTokensApi } from 'api/utils/portfolio';
import clsx from 'clsx';
import { PortfolioChart } from '../PortfolioChart';
import { ZERO } from 'constants/misc';
import { formatSymbol } from 'utils/token';
import { useMobile } from 'utils/isMobile';

export const PortfolioOverview = () => {
  const isMobile = useMobile();
  const { t } = useTranslation();
  const { account, chainId } = useActiveWeb3React();

  const [isPool, setIsPool] = useState(true);

  const [assetPortfolio, setAssetPortfolio] = useState<TAssetPortfolio>();
  const [idleTokenInfo, setIdleTokenInfo] = useState<TIdleTokenInfo>();

  const getAssetPortfolio = useReturnLastCallback(getAssetPortfolioApi, []);
  const refreshUserPortfolio = useCallback(async () => {
    try {
      console.log('getUserPortfolio', account, chainId);
      const data = await getAssetPortfolio({
        address: account,
        chainId,
      });
      setAssetPortfolio(data);
    } catch (error) {
      console.log('getUserPortfolio error', error);
    }
  }, [account, chainId, getAssetPortfolio]);

  const getIdleTokens = useReturnLastCallback(getIdleTokensApi, []);
  const refreshIdleTokens = useCallback(async () => {
    try {
      console.log('getIdleTokens', account, chainId);
      const data = await getIdleTokens({
        address: account,
        chainId,
      });
      setIdleTokenInfo(data);
    } catch (error) {
      console.log('getIdleTokens error', error);
    }
  }, [account, chainId, getIdleTokens]);

  const executeCb = useCallback(async () => {
    console.log('executeCb');
    if (!account || !chainId) return;
    refreshUserPortfolio();
    refreshIdleTokens();
  }, [account, chainId, refreshIdleTokens, refreshUserPortfolio]);
  const executeCbRef = useRef(executeCb);
  executeCbRef.current = executeCb;

  const register = useCallback(() => {
    setAssetPortfolio(undefined);
    setIdleTokenInfo(undefined);
    executeCbRef.current();
    const _timer = setInterval(() => {
      executeCbRef.current();
    }, 30 * 1000);
    return {
      remove: () => {
        clearInterval(_timer);
      },
    };
  }, []);
  useEffect(() => {
    if (!account || !chainId) return;
    const { remove } = register();
    return () => {
      remove();
    };
  }, [account, chainId, register]);

  const positionChartData = useMemo(() => {
    if (isPool) {
      return (
        assetPortfolio?.tradePairPositionDistributions.map((item) => ({
          name: item.tradePair.token0
            ? `${formatSymbol(item.tradePair.token0.symbol)}/${formatSymbol(item.tradePair.token1.symbol)}-${ZERO.plus(
                item.tradePair.feeRate,
              )
                .times(100)
                .toFixed()}`
            : item.name,
          value: ZERO.plus(item.valueInUsd).toNumber(),
        })) || []
      );
    } else {
      return (
        assetPortfolio?.tokenPositionDistributions.map((item) => ({
          name: formatSymbol(item.token.symbol),
          value: ZERO.plus(item.valueInUsd).toNumber(),
        })) || []
      );
    }
  }, [assetPortfolio?.tokenPositionDistributions, assetPortfolio?.tradePairPositionDistributions, isPool]);

  const feeChartData = useMemo(() => {
    if (isPool) {
      return (
        assetPortfolio?.tradePairFeeDistributions.map((item) => ({
          name: item.tradePair.token0
            ? `${formatSymbol(item.tradePair.token0.symbol)}/${formatSymbol(item.tradePair.token1.symbol)}-${ZERO.plus(
                item.tradePair.feeRate,
              )
                .times(100)
                .toFixed()}`
            : item.name,
          value: ZERO.plus(item.valueInUsd).toNumber(),
        })) || []
      );
    } else {
      return (
        assetPortfolio?.tokenFeeDistributions.map((item) => ({
          name: formatSymbol(item.token.symbol),
          value: ZERO.plus(item.valueInUsd).toNumber(),
        })) || []
      );
    }
  }, [assetPortfolio?.tokenFeeDistributions, assetPortfolio?.tradePairFeeDistributions, isPool]);

  const tokenChartData = useMemo(() => {
    return (
      idleTokenInfo?.idleTokens.map((item) => ({
        name: `${formatSymbol(item.tokenDto.symbol)}`,
        value: ZERO.plus(item.valueInUsd).toNumber(),
      })) || []
    );
  }, [idleTokenInfo?.idleTokens]);

  return (
    <div className="portfolio-overview">
      <div className="portfolio-overview-header">
        <Font size={isMobile ? 18 : 22} lineHeight={isMobile ? 26 : 30} weight="medium">
          {t('Overview')}
        </Font>
      </div>
      <div className="portfolio-overview-content">
        <div className="portfolio-overview-total">
          <div className="portfolio-overview-total-switch">
            <div
              onClick={() => {
                setIsPool(true);
              }}
              className={clsx(
                'portfolio-overview-total-switch-btn',
                isPool && 'portfolio-overview-total-switch-active',
              )}>
              <Font size={12} color="two" weight="medium">
                {t('By Pool')}
              </Font>
            </div>
            <div
              onClick={() => {
                setIsPool(false);
              }}
              className={clsx(
                'portfolio-overview-total-switch-btn',
                !isPool && 'portfolio-overview-total-switch-active',
              )}>
              <Font size={12} color="two" weight="medium">
                {t('By Token')}
              </Font>
            </div>
          </div>

          <div className="portfolio-overview-total-left">
            <div className="portfolio-overview-title-wrap">
              <Font size={isMobile ? 14 : 16} lineHeight={isMobile ? 20 : 24}>
                {t('Total Positions')}
              </Font>
              <PriceUSDDigits
                className={getFontStyle({ size: isMobile ? 24 : 32, lineHeight: isMobile ? 32 : 40 })}
                price={assetPortfolio?.totalPositionsInUSD ?? 0}
              />
            </div>

            <PortfolioChart data={positionChartData} />
          </div>

          <div className="portfolio-overview-total-split" />

          <div className="portfolio-overview-total-right">
            <div className="portfolio-overview-title-wrap">
              <Font size={isMobile ? 14 : 16} lineHeight={isMobile ? 20 : 24}>
                {t('Total Fees')}
              </Font>
              <PriceUSDDigits
                className={getFontStyle({ size: isMobile ? 24 : 32, lineHeight: isMobile ? 32 : 40 })}
                price={assetPortfolio?.totalFeeInUSD ?? 0}
              />
            </div>

            <PortfolioChart data={feeChartData} />
          </div>
        </div>

        <div className="portfolio-overview-tokens">
          <div className="portfolio-overview-title-wrap">
            <Font size={isMobile ? 14 : 16} lineHeight={isMobile ? 20 : 24}>
              {t('Idle Tokens')}
            </Font>
            <PriceUSDDigits
              className={getFontStyle({ size: isMobile ? 24 : 32, lineHeight: isMobile ? 32 : 40 })}
              price={idleTokenInfo?.totalValueInUsd ?? 0}
            />
          </div>

          <PortfolioChart data={tokenChartData} />
        </div>
      </div>
    </div>
  );
};
