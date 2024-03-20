import { useMemo, memo, useState } from 'react';
import moment from 'moment';
import { useWebLogin } from 'aelf-web-login';
import { useMarketTradeList, useUserTradList } from 'pages/Exchange/hooks/useLatestList';
import { useUrlParams } from 'hooks/Exchange/useUrlParams';
import { TradeItem } from 'socket/socketType';
import { useTranslation } from 'react-i18next';
import { useMobile } from 'utils/isMobile';
import { useWindowSize } from 'react-use';

import { ColumnType } from 'antd/lib/table';
import CommonMenu from 'components/CommonMenu';
import { CommonTableList } from 'components/CommonTable';
import FallOrRise from 'components/FallOrRise';
import CommonCard from 'components/CommonCard';
import useLoginCheck from 'hooks/useLoginCheck';
import BigNumber from 'bignumber.js';
import { formatPrice, formatLiquidity } from 'utils/price';

import './LatestTrade.less';
import { usePairTokens, useSwapContext } from 'pages/Exchange/hooks/useSwap';
import { getPairsOrderByTokenWeights } from 'utils/pair';
import { getTokenWeights } from 'utils/token';

const menus = [
  {
    key: 'market',
    name: 'latestTrading',
  },
  {
    key: 'my',
    name: 'myTrades',
  },
];

function LatestTrade() {
  const { t } = useTranslation();
  const { wallet } = useWebLogin();

  const isMobile = useMobile();

  const { width } = useWindowSize();

  const [{ pairInfo }] = useSwapContext();

  const marketList = useMarketTradeList(pairInfo?.id, 50);

  const userList = useUserTradList(pairInfo?.id, wallet?.address, 50);

  const [menu, setMenu] = useState<string | number>('market');

  const dataSource = useMemo(() => {
    switch (menu) {
      case 'market':
        return marketList;
      case 'my':
        return userList;
      default:
        return [];
    }
  }, [marketList, userList, menu]);

  const onChangeMenu = useLoginCheck<string | number>(
    {
      checkAccountSync: false,
    },
    (menu) => {
      setMenu(menu);
    },
  );

  const priceLabelWidth = useMemo(() => {
    if (isMobile) {
      return 108;
    }
    if (width > 1919) {
      return 170;
    }
    if (width > 1679 && width < 1920) {
      return 155;
    }
    if (width < 1680) {
      return 100;
    }
  }, [width, isMobile]);

  const columns = useMemo<ColumnType<TradeItem>[]>(() => {
    const defaultColumnx: ColumnType<TradeItem>[] = [
      {
        title: `${t('price')}(${
          getPairsOrderByTokenWeights(pairInfo?.token0?.symbol, pairInfo?.token1.symbol)[1] || ''
        })`,
        dataIndex: 'price',
        key: 'price',
        width: priceLabelWidth,
        render: (price: string, record: TradeItem) => {
          return (
            <FallOrRise
              num={price}
              displayNum={formatPrice(new BigNumber(price))}
              status={record.side === 0 ? 1 : -1}
              usePrefix={false}
              useSubfix={false}
              size={12}
            />
          );
        },
      },
      {
        title: `${t('amount')}(${
          getPairsOrderByTokenWeights(pairInfo?.token0?.symbol, pairInfo?.token1.symbol)[0] || ''
        })`,
        dataIndex: 'token0Amount',
        key: 'token0Amount',
        width: isMobile ? 'auto' : 90,
        align: 'right',
        render: (token0Amount: string, record: TradeItem) => (
          <span className="last-trade-table-cell">
            {formatLiquidity(
              getTokenWeights(pairInfo?.token0?.symbol) > getTokenWeights(pairInfo?.token1?.symbol)
                ? record.token1Amount
                : token0Amount,
              8,
            )}
          </span>
        ),
      },
      {
        title: t('time'),
        dataIndex: 'timestamp',
        key: 'timestamp',
        align: 'right',
        render: (timestamp: string) => (
          <span className="last-trade-table-cell">{moment(timestamp).format('HH:mm:ss')}</span>
        ),
      },
    ];

    if (isMobile) {
      defaultColumnx.pop();
    }

    return defaultColumnx;
  }, [t, pairInfo?.token0?.symbol, pairInfo?.token1.symbol, priceLabelWidth, isMobile]);

  const tableProps: Record<string, any> = {
    columns: columns,
    rowKey: 'id',
    dataSource: dataSource,
    emptyType: 'nodata',
    emptyText: t('noTrades'),
  };

  return (
    <CommonCard
      className="latest-transaction"
      title={<CommonMenu menus={menus} value={menu} onChange={onChangeMenu} className="transaction-menu" />}>
      <CommonTableList {...tableProps} scroll={{ y: 600 }} />
    </CommonCard>
  );
}

export default memo(LatestTrade);
