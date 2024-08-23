import './styles.less';
import Font from 'components/Font';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMobile } from 'utils/isMobile';
import { IconArrowRight2 } from 'assets/icons';
import { useReturnLastCallback } from 'hooks';
import { useActiveWeb3React } from 'hooks/web3';
import { CommonTable } from 'components/CommonTable';
import { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { getTokenWeights } from 'utils/token';
import { formatPriceChange } from 'utils/price';
import { Pair } from 'components/Pair';
import PriceUSDDigits from 'components/PriceUSDDigits';
import getFontStyle, { FontColor } from 'utils/getFontStyle';
import { getExploreLink } from 'utils';
import { stringMidShort } from 'utils/string';
import CommonCopy from 'components/CommonCopy';
import CommonList from 'components/CommonList';
import { Col, Row } from 'antd';
import { useHistory } from 'react-router-dom';
import { SWAP_TIME_INTERVAL } from 'constants/misc';
import { useIsConnected } from 'hooks/useLogin';
import { LiquidityRecord, RecentTransaction } from 'types/transactions';
import { getTransactionList } from 'api/utils/recentTransaction';

export function SwapTransactionItem({
  item: { tradePair, timestamp, side, token0Amount, token1Amount, transactionHash, totalPriceInUsd },
}: {
  item: RecentTransaction;
}) {
  const { t } = useTranslation();
  const sideInfo = useMemo<{
    label: string;
    fontColor?: FontColor;
  }>(() => {
    if (side === 2)
      return {
        label: t('Swap'),
      };
    const isReverse =
      // trade pair sort
      getTokenWeights(tradePair.token0.symbol) > getTokenWeights(tradePair.token1.symbol) &&
      // contract sort
      tradePair.token0.symbol < tradePair.token1.symbol;
    const isBuy = Boolean(Number(side === 0) ^ Number(isReverse));
    if (isBuy) {
      return {
        label: t('buy'),
        fontColor: 'rise',
      };
    } else {
      return {
        label: t('sell'),
        fontColor: 'fall',
      };
    }
  }, [side, t, tradePair.token0.symbol, tradePair.token1.symbol]);

  return (
    <Row className="swap-transaction-list-item" gutter={[0, 8]}>
      <Col span={24}>
        <Row justify="space-between" wrap={false}>
          <Col flex={'1'}>
            <Font lineHeight={20} color={sideInfo.fontColor}>
              {sideInfo.label}
            </Font>
          </Col>
          <Col flex={'1'} className="align-right">
            <Font color="two" size={12} lineHeight={20}>
              {moment(timestamp).format('YYYY-MM-DD HH:mm:ss')}
            </Font>
          </Col>
        </Row>
      </Col>

      <Col span={12} className="height-20">
        <Font lineHeight={20} color="two">
          {t('Pay')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20">
        <Font lineHeight={20}>{formatPriceChange(side === 0 ? token1Amount : token0Amount)}</Font>
        &nbsp;
        <Pair lineHeight={20} symbol={side === 0 ? tradePair?.token1?.symbol : tradePair?.token0?.symbol} />
      </Col>

      <Col span={12} className="height-20">
        <Font lineHeight={20} color="two">
          {t('Receive')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20">
        <Font lineHeight={20}>{`${formatPriceChange(side === 0 ? token0Amount : token1Amount)}`}</Font>
        &nbsp;
        <Pair lineHeight={20} symbol={side === 0 ? tradePair?.token0?.symbol : tradePair?.token1?.symbol} />
      </Col>

      <Col span={12} className="height-20">
        <Font lineHeight={20} color="two">
          {t('Value')}
        </Font>
      </Col>
      <Col span={12} className="align-right height-20">
        <PriceUSDDigits className={getFontStyle({ lineHeight: 24 })} price={totalPriceInUsd} />,
      </Col>

      <Col span={11} className="height-20">
        <Font lineHeight={20} color="two">
          {t('transactionID')}
        </Font>
      </Col>
      <Col span={13} className="align-right height-20">
        <Row>
          <Col>
            <a
              target="_blank"
              href={getExploreLink(transactionHash || '', 'transaction')}
              style={{ wordBreak: 'break-all' }}>
              {stringMidShort(transactionHash || '', 8)}
            </a>
          </Col>
          <Col>
            <CommonCopy copyInfo="" copyValue={transactionHash} className="copy-address"></CommonCopy>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}

export const SwapHistory = () => {
  const { account, chainId } = useActiveWeb3React();
  const isMobile = useMobile();
  const { t } = useTranslation();
  const isConnected = useIsConnected();

  const [list, setList] = useState<RecentTransaction[]>([]);
  const dataSource = useMemo(() => {
    return isConnected ? list : [];
  }, [isConnected, list]);

  const getLastTransactionList = useReturnLastCallback<typeof getTransactionList>(getTransactionList, []);

  const [isLoading, setIsLoading] = useState(true);
  const refreshTransactionList = useCallback(async () => {
    try {
      console.log('refreshTransactionList');
      const result = await getLastTransactionList({
        address: account,
        chainId: chainId,
        skipCount: 0,
        maxResultCount: 3,
      });
      console.log('refreshTransactionList: result', result);

      setList(result.items || []);
    } catch (error) {
      console.log('refreshTransactionList error', error);
      //
    } finally {
      setIsLoading(false);
    }
  }, [account, chainId, getLastTransactionList]);
  const refreshTransactionListRef = useRef(refreshTransactionList);
  refreshTransactionListRef.current = refreshTransactionList;

  const register = useCallback(() => {
    refreshTransactionListRef.current();
    const _timer = setInterval(() => {
      refreshTransactionListRef.current();
    }, SWAP_TIME_INTERVAL);

    return {
      remove: () => {
        clearInterval(_timer);
      },
    };
  }, []);

  useEffect(() => {
    const { remove } = register();
    return remove;
  }, [register]);

  const columns = useMemo<ColumnsType<RecentTransaction | LiquidityRecord>>(() => {
    const columnList: ColumnsType<RecentTransaction | LiquidityRecord> = [
      {
        title: t('timestamp'),
        width: 68,
        key: 'timestamp',
        dataIndex: 'timestamp',
        render: (val: string) => (
          <Font lineHeight={20} size={12}>
            {moment(val).format('YYYY-MM-DD HH:mm:ss')}
          </Font>
        ),
      },
      {
        title: t('side'),
        key: 'side',
        width: 36,
        dataIndex: 'side',
        align: 'left',
        render: (side: number, record: RecentTransaction) => {
          if (side === 2) {
            return (
              <Font lineHeight={20} size={14}>
                {t('Swap')}
              </Font>
            );
          }
          const isReverse =
            // trade pair sort
            getTokenWeights(record.tradePair.token0.symbol) > getTokenWeights(record.tradePair.token1.symbol) &&
            // contract sort
            record.tradePair.token0.symbol < record.tradePair.token1.symbol;
          const isBuy = Boolean(Number(side === 0) ^ Number(isReverse));
          return (
            <Font lineHeight={20} size={14} color={isBuy ? 'rise' : 'fall'}>
              {isBuy ? t('buy') : t('sell')}
            </Font>
          );
        },
      },
      {
        title: t('Pay'),
        key: 'token0Amount',
        dataIndex: 'token0Amount',
        width: 110,
        align: 'left',
        render: (token0Amount: string | undefined, record: RecentTransaction) => {
          let _amount = token0Amount;
          let _symbol = record?.tradePair?.token0?.symbol;
          if (record.side === 0) {
            _amount = record.token1Amount;
            _symbol = record?.tradePair?.token1?.symbol;
          }
          return (
            <>
              <Font lineHeight={20} size={14}>
                {formatPriceChange(_amount)}
              </Font>
              &nbsp;
              <Pair lineHeight={20} size={14} symbol={_symbol} />
            </>
          );
        },
      },
      {
        title: t('Receive'),
        key: 'token1Amount',
        dataIndex: 'token1Amount',
        align: 'left',
        width: 110,
        render: (token1Amount: string | undefined, record: RecentTransaction) => {
          let _amount = token1Amount;
          let _symbol = record?.tradePair?.token1?.symbol;
          if (record.side === 0) {
            _amount = record.token0Amount;
            _symbol = record?.tradePair?.token0?.symbol;
          }
          return (
            <>
              <Font lineHeight={24}>{formatPriceChange(_amount)}</Font>
              &nbsp;
              <Pair lineHeight={24} symbol={_symbol} />
            </>
          );
        },
      },
      {
        title: t('Value'),
        key: 'totalPriceInUsd',
        dataIndex: 'totalPriceInUsd',
        align: 'left',
        width: 80,
        render: (_val: number) => {
          return <PriceUSDDigits className={getFontStyle({ lineHeight: 24 })} price={_val} />;
        },
      },
      {
        title: t('transactionID'),
        key: 'transactionHash',
        dataIndex: 'transactionHash',
        align: 'right',
        width: 92,
        render: (val: string) => (
          <div className="transaction-hash-wrap">
            <div className="transaction-hash-label">
              <a target="_blank" href={getExploreLink(val, 'transaction')} className="transaction-hash-link">
                {stringMidShort(val)}
              </a>
            </div>
            <CommonCopy copyInfo="" copyValue={val} className="copy-address" />
          </div>
        ),
      },
    ];

    return columnList;
  }, [t]);

  const renderItem = (item: LiquidityRecord | RecentTransaction) => {
    return <SwapTransactionItem item={item} key={item?.transactionHash} />;
  };

  const history = useHistory();
  const toAll = useCallback(() => {
    history.push(`/transactions`);
  }, [history]);

  return (
    <div className="swap-history">
      {isMobile && <div className="swap-history-bg" />}
      <div className="swap-history-header">
        <Font size={20} lineHeight={24}>
          {t('My Orders')}
        </Font>

        <div className="swap-history-view-btn" onClick={toAll}>
          <Font color="two" className="swap-history-view-btn-label" size={14} lineHeight={22}>
            {t('View All')}
          </Font>
          <IconArrowRight2 />
        </div>
      </div>
      <div className="swap-history-content">
        {isMobile ? (
          <CommonList
            className="swap-transaction-list-wrapper"
            dataSource={dataSource}
            renderItem={renderItem}
            loading={isLoading}
            pageNum={1}
            hideNoMoreOnSinglePage={true}
          />
        ) : (
          <CommonTable
            loading={isLoading}
            dataSource={dataSource}
            columns={columns}
            rowKey={(record: { transactionHash: string }) => record?.transactionHash}
            emptyType="nodata"
            className="transaction-box"
          />
        )}
      </div>
    </div>
  );
};
