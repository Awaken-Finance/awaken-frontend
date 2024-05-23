import { useMemo, memo, useState } from 'react';
import moment from 'moment';
import { useWebLogin } from 'aelf-web-login';
import { useMarketTradeList, useUserTradList } from 'pages/Exchange/hooks/useLatestList';
import { TradeItem } from 'socket/socketType';
import { useTranslation } from 'react-i18next';
import { ColumnType } from 'antd/lib/table';
import CommonMenu from 'components/CommonMenu';
import { CommonTableList } from 'components/CommonTable';
import FallOrRise from 'components/FallOrRise';
import CommonCard from 'components/CommonCard';
import useLoginCheck from 'hooks/useLoginCheck';
import { formatLiquidity } from 'utils/price';
import { useSwapContext } from 'pages/Exchange/hooks/useSwap';

import './LatestTrade.less';
import { getRealPrice } from 'utils/calculate';
import { formatSymbol } from 'utils/token';

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
  const [{ pairInfo }] = useSwapContext();

  const marketList = useMarketTradeList(pairInfo?.id, 200);

  const userList = useUserTradList(pairInfo?.id, wallet?.address, 200);

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

  const columns = useMemo<ColumnType<TradeItem>[]>(() => {
    return [
      {
        title: `${t('price')}(${pairInfo?.token1.symbol || ''})`,
        dataIndex: 'price',
        key: 'price',
        width: 96,
        render: (_price: string, record: TradeItem) => {
          const price = getRealPrice({
            side: record.side,
            token0Amount: record.token0Amount,
            token1Amount: record.token1Amount,
            feeRate: record.tradePair.feeRate || pairInfo?.feeRate,
          });
          return (
            <FallOrRise
              num={price}
              isPrice
              status={record.side === 0 ? 1 : -1}
              usePrefix={false}
              useSuffix={false}
              size={12}
            />
          );
        },
      },
      {
        title: `${t('amount')}(${formatSymbol(pairInfo?.token0?.symbol)})`,
        dataIndex: 'token0Amount',
        key: 'token0Amount',
        width: 110,
        align: 'right',
        render: (token0Amount: string) => {
          return <span className="last-trade-table-cell">{formatLiquidity(token0Amount)}</span>;
        },
      },
      {
        title: `${t('time')}`,
        dataIndex: 'timestamp',
        key: 'timestamp',
        width: 80,
        align: 'right',
        render: (timestamp: string) => (
          <span className="last-trade-table-cell">{moment(timestamp).format('HH:mm:ss')}</span>
        ),
      },
    ];
  }, [t, pairInfo?.token1.symbol, pairInfo?.token0?.symbol, pairInfo?.feeRate]);

  const tableProps: Record<string, any> = {
    columns: columns,
    rowKey: 'id',
    dataSource: dataSource,
    emptyType: 'nodata',
    emptyText: t('noTrades'),
    scroll: dataSource?.length ? { y: 600, x: 0 } : null,
    loading: typeof dataSource === 'undefined',
  };

  return (
    <CommonCard
      className="latest-transaction"
      title={<CommonMenu menus={menus} value={menu} onChange={onChangeMenu} className="transaction-menu" />}>
      <CommonTableList {...tableProps} />
    </CommonCard>
  );
}

export default memo(LatestTrade);
