import Font from 'components/Font';
import './styles.less';
import { useTranslation } from 'react-i18next';
import { CircleProcess, CircleProcessInterface } from 'components/CircleProcess';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useActiveWeb3React } from 'hooks/web3';
import { TTLiquidityPositionResult } from 'types/portfolio';
import { useReturnLastCallback } from 'hooks';
import { getLiquidityPositionApi } from 'api/utils/portfolio';
import { PortfolioPositionsList } from './components/PortfolioPositionsList';
import { useMobile } from 'utils/isMobile';
import { PortfolioPositionsMobileList } from './components/PortfolioPositionsMobileList';

const INIT_PAGINATION = {
  pageNum: 1,
  pageSize: 10,
};

export const PortfolioPositions = () => {
  const isMobile = useMobile();
  const { t } = useTranslation();
  const circleProcessRef = useRef<CircleProcessInterface>();

  const { account, chainId } = useActiveWeb3React();

  const [liquidity, setLiquidity] = useState<TTLiquidityPositionResult>();
  const getLiquidityPosition = useReturnLastCallback(getLiquidityPositionApi, []);

  const paginationRef = useRef({ ...INIT_PAGINATION });

  const [isLoading, setIsLoading] = useState(true);
  const executeCb = useCallback(async () => {
    console.log('executeCb', paginationRef.current);
    if (!account || !chainId) return;
    setIsLoading(true);
    try {
      const { pageNum, pageSize } = paginationRef.current;

      const data = await getLiquidityPosition({
        address: account,
        chainId,
        skipCount: isMobile ? 0 : (pageNum - 1) * pageSize,
        maxResultCount: isMobile ? pageNum * pageSize : pageSize,
      });

      setLiquidity(data);
    } catch (error) {
      console.log('getLiquidityPosition error', error);
    } finally {
      console.log('executeCb finally');
      setIsLoading(false);
    }
  }, [account, chainId, getLiquidityPosition, isMobile]);
  const executeCbRef = useRef(executeCb);
  executeCbRef.current = executeCb;

  const register = useCallback(() => {
    setLiquidity(undefined);
    executeCbRef.current();
    circleProcessRef.current?.start();

    const _timer = setInterval(() => {
      executeCbRef.current();
      circleProcessRef.current?.start();
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

  const [pagination, setPagination] = useState({ ...INIT_PAGINATION });
  const onPageChange = useCallback(async (pageNum: number, pageSize: number) => {
    paginationRef.current = {
      pageNum,
      pageSize,
    };
    setPagination(paginationRef.current);
    await executeCbRef.current();
  }, []);

  return (
    <div className="portfolio-position">
      <div className="portfolio-position-header">
        <Font size={22} lineHeight={30} weight="medium">
          {t('My Positions')}
        </Font>

        <CircleProcess ref={circleProcessRef} />
      </div>

      {!isMobile && <PortfolioPositionsList liquidity={liquidity} isLoading={isLoading} onPageChange={onPageChange} />}

      {isMobile && (
        <PortfolioPositionsMobileList
          liquidity={liquidity}
          isLoading={isLoading}
          onPageChange={onPageChange}
          pageNum={pagination.pageNum}
          pageSize={pagination.pageSize}
        />
      )}
    </div>
  );
};
