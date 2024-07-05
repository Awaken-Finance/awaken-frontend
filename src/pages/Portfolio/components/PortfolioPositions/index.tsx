import Font from 'components/Font';
import './styles.less';
import { useTranslation } from 'react-i18next';
import { CircleProcess, CircleProcessInterface } from 'components/CircleProcess';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useActiveWeb3React } from 'hooks/web3';
import { TTLiquidityPositionResult } from 'types/portfolio';
import { useReturnLastCallback } from 'hooks';
import { getLiquidityPositionApi } from 'api/utils/portfolio';
import { Pagination } from 'antd';
import { PortfolioPositionItem } from '../PortfolioPositionItem';
import Lottie from 'lottie-react';
import { awakenLoading } from 'assets/animation';
import CommonButton from 'components/CommonButton';
import { useHistory } from 'react-router-dom';

export const PortfolioPositions = () => {
  const { t } = useTranslation();
  const circleProcessRef = useRef<CircleProcessInterface>();

  const { account, chainId } = useActiveWeb3React();

  const [liquidity, setLiquidity] = useState<TTLiquidityPositionResult>();
  const getLiquidityPosition = useReturnLastCallback(getLiquidityPositionApi, []);

  const paginationRef = useRef({
    pageNum: 1,
    pageSize: 10,
  });

  const [isLoading, setIsLoading] = useState(true);
  const executeCb = useCallback(async () => {
    console.log('executeCb', paginationRef.current);
    if (!account || !chainId) return;
    setIsLoading(true);
    try {
      const data = await getLiquidityPosition({
        address: account,
        chainId,
        skipCount: (paginationRef.current.pageNum - 1) * paginationRef.current.pageSize,
        maxResultCount: paginationRef.current.pageSize,
      });
      setLiquidity(data);
    } catch (error) {
      console.log('getLiquidityPosition error', error);
    } finally {
      setIsLoading(false);
    }
  }, [account, chainId, getLiquidityPosition]);
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

  const onPageChange = useCallback((pageNum: number, pageSize: number) => {
    paginationRef.current = {
      pageNum,
      pageSize,
    };
    executeCbRef.current();
  }, []);

  const history = useHistory();
  const onAddLiquidityClick = useCallback(() => {
    history.push('/liquidity/ELF_USDT_0.05/add');
  }, [history]);

  return (
    <div className="portfolio-position">
      <div className="portfolio-position-header">
        <Font size={22} lineHeight={30} weight="medium">
          {t('My Positions')}
        </Font>

        <CircleProcess ref={circleProcessRef} />
      </div>

      <div className="portfolio-position-content">
        {liquidity?.items.map((item) => (
          <PortfolioPositionItem key={item.tradePairInfo.address} item={item} />
        ))}

        {liquidity && liquidity.totalCount === 0 && (
          <div className="portfolio-position-empty">
            <div className="portfolio-position-empty-content">
              <div className="portfolio-position-empty-title">
                <Font size={16} color="two" lineHeight={24} weight="bold">
                  {t('No positions yet')}
                </Font>
                <Font size={14} color="two" weight="regular">
                  {t('Open a new position or create a pool to get started')}
                </Font>
              </div>

              <CommonButton type="primary" onClick={onAddLiquidityClick}>{`+ ${t('Add Liquidity')}`}</CommonButton>
            </div>
          </div>
        )}
      </div>

      {!liquidity && isLoading && (
        <div className="portfolio-position-loading-wrap">
          <Lottie className="loading-box-animation" animationData={awakenLoading} loop />
        </div>
      )}

      {liquidity && <Pagination total={liquidity?.totalCount ?? 0} showSizeChanger onChange={onPageChange} />}
    </div>
  );
};
