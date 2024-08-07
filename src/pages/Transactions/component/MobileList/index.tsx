import { useCallback } from 'react';
import { Menu } from 'antd';
import { RecentTransaction, LiquidityRecord } from 'pages/UserCenter/type';
import TransactionItem from './TransactionItem';
import LiquidityRecordItem from './LiquidityRecordItem';
import CommonList from 'components/CommonList';
import { SortOrder } from 'antd/lib/table/interface';
import './index.less';
import { useTranslation } from 'react-i18next';
import CommonButton from 'components/CommonButton';
import { IconArrowLeft } from 'assets/icons';
import Font from 'components/Font';
import { useHistory } from 'react-router-dom';

export default function MobileList({
  dataSource = [],
  total,
  loading,
  getData = () => null,
  pageNum,
  pageSize,
  field,
  order,
  menuChange,
  menu,
  menuList,
  side,
}: {
  dataSource?: RecentTransaction[] | LiquidityRecord[] | undefined;
  total?: number;
  loading?: boolean;
  getData?: (args: any) => void;
  pageNum?: number;
  pageSize?: number;
  field?: string | null;
  order?: SortOrder | undefined | null;
  side: number;
  menuChange: (val: string | number) => void;
  menu?: string | number;
  menuList: any[];
}) {
  const { t } = useTranslation();

  // const [sidVisible, setSidVisible] = useState(false);
  // const ref = useOutSideClick(
  //   useCallback(() => {
  //     setSidVisible(false);
  //   }, []),
  // );
  // const sidChange = (val: number) => {
  //   setSidVisible(false);
  //   getData({
  //     page: pageNum,
  //     pageSize,
  //     field,
  //     order,
  //     filter: {
  //       side: [val],
  //     },
  //   });
  // };

  const fetchList = useCallback(
    () =>
      getData({
        page: (pageNum ?? 1) + 1,
        pageSize,
        field,
        order,
        filter: {
          side: [side],
        },
      }),
    [getData, field, order, pageSize, pageNum, side],
  );

  const renderItem = (item: LiquidityRecord | RecentTransaction) => {
    if (menu === 'all') {
      return <TransactionItem item={item} key={item?.transactionHash} />;
    }

    return <LiquidityRecordItem item={item} key={item?.transactionHash} />;
  };

  const history = useHistory();
  const onBack = useCallback(() => {
    history.goBack();
  }, [history]);

  return (
    <div className="transaction-list">
      {/* <Row align="middle" justify="space-between" className="transaction-list-header">
        <Col>
          <CommonMenu menus={menuList} onChange={menuChange} value={menu} className="transaction-list-menu" />
        </Col>
        <Col>
          {menu === 'all' && (
            <div className="transaction-list-filter">
              <IconFilter onClick={() => setSidVisible(true)} />
              {sidVisible && (
                <div ref={ref} className="transaction-list-filter-box">
                  <Filter val={side} onChange={sidChange} />
                </div>
              )}
            </div>
          )}
        </Col>
      </Row> */}
      <div className="transaction-mobile-header">
        <CommonButton
          className="transaction-mobile-header-back"
          type="text"
          icon={<IconArrowLeft />}
          onClick={onBack}
        />

        <Font size={16} lineHeight={24} weight="medium">
          {t('recentTransaction')}
        </Font>
      </div>

      <Menu
        mode="horizontal"
        selectedKeys={[String(menu)]}
        className="transaction-mobile-menu-headers"
        overflowedIndicator={<></>}>
        {menuList.map((item) => (
          <Menu.Item
            key={item.key}
            onClick={() => {
              menuChange(item.key);
            }}>
            {t(item.name)}
          </Menu.Item>
        ))}
      </Menu>

      <div className="transaction-list-box">
        <CommonList
          className="transaction-list-wrapper"
          dataSource={dataSource}
          renderItem={renderItem}
          total={total}
          loading={loading}
          getMore={fetchList}
          pageNum={pageNum}
        />
      </div>
    </div>
  );
}
