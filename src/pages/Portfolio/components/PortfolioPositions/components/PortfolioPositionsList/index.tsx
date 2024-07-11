import { Pagination } from 'antd';
import { awakenLoading } from 'assets/animation';
import CommonButton from 'components/CommonButton';
import Font from 'components/Font';
import Lottie from 'lottie-react';
import { PortfolioPositionItem } from 'pages/Portfolio/components/PortfolioPositionItem';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { TTLiquidityPositionResult } from 'types/portfolio';
import './styles.less';

export type TPortfolioPositionsListProps = {
  liquidity?: TTLiquidityPositionResult;
  isLoading: boolean;
  onPageChange: (pageNum: number, pageSize: number) => void;
};

export const PortfolioPositionsList = ({ liquidity, isLoading, onPageChange }: TPortfolioPositionsListProps) => {
  const { t } = useTranslation();
  const history = useHistory();
  const onAddLiquidityClick = useCallback(() => {
    history.push('/liquidity/ELF_USDT_0.05/add');
  }, [history]);

  return (
    <div className="portfolio-positions-list">
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

      {liquidity && (
        <Pagination total={liquidity?.totalCount ?? 0} showSizeChanger onChange={onPageChange} hideOnSinglePage />
      )}
    </div>
  );
};
