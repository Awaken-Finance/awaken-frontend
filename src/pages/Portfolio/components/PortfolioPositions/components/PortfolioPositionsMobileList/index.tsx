import CommonButton from 'components/CommonButton';
import Font from 'components/Font';
import { PortfolioPositionItem } from 'pages/Portfolio/components/PortfolioPositionItem';
import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { TLiquidityPositionItem, TTLiquidityPositionResult } from 'types/portfolio';
import './styles.less';
import CommonList from 'components/CommonList';

export type TPortfolioPositionsMobileListProps = {
  liquidity?: TTLiquidityPositionResult;
  isLoading: boolean;
  pageNum: number;
  pageSize: number;
  onPageChange: (pageNum: number, pageSize: number) => void | Promise<void>;
};

export const PortfolioPositionsMobileList = ({
  liquidity,
  isLoading,
  pageNum,
  pageSize,
  onPageChange,
}: TPortfolioPositionsMobileListProps) => {
  const { t } = useTranslation();
  const history = useHistory();
  const onAddLiquidityClick = useCallback(() => {
    history.push('/liquidity/ELF_USDT_0.05/add');
  }, [history]);

  const renderItem = (item: TLiquidityPositionItem) => {
    return <PortfolioPositionItem item={item} />;
  };

  const isFetchRef = useRef(false);
  const fetchList = useCallback(async () => {
    if (isFetchRef.current) return;
    isFetchRef.current = true;

    await onPageChange(++pageNum, pageSize);
    isFetchRef.current = false;
  }, [onPageChange, pageNum, pageSize]);

  const isExist = useMemo(() => {
    return !liquidity || liquidity.items.length > 0;
  }, [liquidity]);

  return (
    <div className="portfolio-positions-mobile-list">
      <div className="portfolio-position-content">
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

        {isExist && (
          <CommonList
            className=" v-wrapper"
            dataSource={liquidity?.items || []}
            renderItem={renderItem}
            total={liquidity?.totalCount}
            loading={!liquidity && isLoading}
            getMore={fetchList}
            pageNum={pageNum}
          />
        )}
      </div>
    </div>
  );
};
