import { useMemo } from 'react';
import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';
import clsx from 'clsx';
import { ColumnsType } from 'antd/lib/table/interface';

import SearchTairByName from 'components/SearchTairByName';
import TradingMeunList from 'components/TradingMeunList';
import { CollectionBtnInList } from 'Buttons/CollectionBtn';
import FallOrRise from 'components/FallOrRise';
import CommonCard from 'components/CommonCard';
import { Pairs } from 'components/Pair';
import FeeRate from 'components/FeeRate';
import { PairItem } from 'types';
import useSearchPairList from 'pages/Overview/hooks/useSearchPairList';
import Signalr from 'socket/signalr';
import { useGoSwapPage } from 'Buttons/SwapBtn';
import { formatPercentage, formatPrice } from 'utils/price';
import { useMobile } from 'utils/isMobile';
import ScrollTableList from 'components/CommonTable/ScrollTableList';
import { useWindowSize } from 'react-use';

import './index.less';

interface TradePairListProps {
  widths?: number[];
  title?: React.ReactChild | string | null;
  height?: number | string;
  socket?: Signalr | null;
  onSelect?: (pairInfo: PairItem) => void;
}

export default function TradePairList({
  title = null,
  height = '860px',
  socket,
  onSelect = () => null,
}: TradePairListProps) {
  const { t, i18n } = useTranslation();

  const isMobile = useMobile();

  const { width } = useWindowSize();

  const [{ dataSource, loading, total, pageInfo }, { getData = () => null }] = useSearchPairList(
    {
      page: 1,
    },
    {
      customPageSize: 50,
      socket,
      scrollLoad: true,
    },
  );

  const callback = useGoSwapPage();

  const isLargeScreen = useMemo(() => width > 1919, [width]);

  const pairsLabelWidth = useMemo(() => {
    if (isMobile) {
      return 200;
    }
    if (width > 1919) {
      return 226;
    }
    if (width > 1679 && width < 1920) {
      return 206;
    }
    if (width < 1680) {
      return 140;
    }
  }, [width, isMobile]);

  const columns: ColumnsType<PairItem> = useMemo(
    () => [
      {
        title: t('pairs'),
        dataIndex: 'tradePair',
        key: 'tradePair',
        sorter: true,
        sortOrder: pageInfo?.field === 'tradePair' ? pageInfo?.order : null,
        width: pairsLabelWidth,
        render: (id: string, pairData: PairItem) => {
          return (
            <Row align="top" wrap={false}>
              <Col className="pari-collect">
                <CollectionBtnInList favId={pairData?.favId} id={pairData?.id} isFav={pairData.isFav} />
              </Col>
              <Col>
                <Row gutter={[4, 0]} align="middle">
                  <Col className="pair-name">
                    <Pairs lineHeight={18} size={12} tokenA={pairData.token0} tokenB={pairData.token1} />
                  </Col>
                  <Col>
                    <FeeRate lineHeight={18} size={12} useBg className="trade-pair-fee-rate-use-bg">
                      {formatPercentage(pairData?.feeRate * 100)}
                    </FeeRate>
                  </Col>
                </Row>
              </Col>
            </Row>
          );
        },
      },
      {
        title: t('price'),
        width: !isLargeScreen && !isMobile ? 0 : 'auto',
        dataIndex: 'priceUSD',
        key: 'priceUSD',
        sorter: true,
        sortOrder: pageInfo?.field === 'priceUSD' ? pageInfo?.order : null,
        align: 'right',
        className: !isLargeScreen && !isMobile ? 'small-column-title' : '',
        render: (price: string) =>
          isLargeScreen || isMobile ? <span className="trade-pair-table-cell">{formatPrice(price)}</span> : null,
      },
      {
        title: (
          <div>
            {!isLargeScreen && !isMobile && <span className="trade-pair-table-column-slash">/</span>}
            {t('change%')}
          </div>
        ),
        width: 'auto',
        dataIndex: 'pricePercentChange24h',
        key: 'pricePercentChange24h',
        align: 'right',
        sorter: true,
        sortOrder: pageInfo?.field === 'pricePercentChange24h' ? pageInfo?.order : null,
        render: (change: number, _: PairItem) =>
          !isLargeScreen && !isMobile ? (
            <Col>
              <div className="trade-pair-table-cell">{formatPrice(_.price)}</div>
              <FallOrRise lineHeight={18} size={12} num={new BigNumber(change).toFixed(2)} />
            </Col>
          ) : (
            <FallOrRise lineHeight={18} size={12} num={new BigNumber(change).toFixed(2)} />
          ),
      },
    ],
    [t, pageInfo?.field, pageInfo?.order, pairsLabelWidth, isLargeScreen, isMobile],
  );

  const emptyStatus = useMemo(() => {
    if (pageInfo?.poolType === 'fav') {
      return {
        type: 'nodata',
        text: t('noFavoritePairs'),
      };
    }
    return {
      type: 'search',
      text: t('noSearch'),
    };
  }, [pageInfo?.poolType, t]);

  return (
    <CommonCard className={clsx('trade-pair-list', !isMobile && 'tarding-pair-list-pc')} title={title}>
      <Row>
        <Col span={24} className="search">
          <SearchTairByName
            className={clsx('search-input', isMobile && 'mobile')}
            onChange={(searchVal) => getData({ searchVal })}
            value={pageInfo?.searchVal}
          />
        </Col>
        <Col className="tard-meun" span={24}>
          <TradingMeunList className="tard-meun-list" onChange={getData} source="trade" />
        </Col>
        <Col
          style={{ height: height, overflowY: 'auto' }}
          className={clsx(
            i18n.language === 'en' && !isMobile && 'tarding-pair-list-pc-en',
            i18n.language === 'zh_TW' && !isMobile && 'tarding-pair-list-pc-tw',
          )}>
          <ScrollTableList
            useWindow
            dataSource={dataSource}
            columns={columns}
            loading={loading}
            total={total}
            rowKey="id"
            onChange={getData}
            onRow={(record: PairItem) => {
              return {
                onClick: () => {
                  callback(record);
                  onSelect(record);
                },
              };
            }}
            emptyType={emptyStatus.type}
            emptyText={emptyStatus.text}
            {...pageInfo}
            pageSize={50}
            nothingMoreMsg="NoMorePairs"
          />
        </Col>
      </Row>
    </CommonCard>
  );
}
