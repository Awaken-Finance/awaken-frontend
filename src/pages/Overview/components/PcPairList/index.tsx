import { FetchParam } from 'types/requeset';
import { PairItem } from 'types';
import PairHeader from './components/PairHeader';
import PairsList from './components/PairList';
import { SortOrder } from 'antd/lib/table/interface';

import './index.less';

const PcPairList = ({
  getData = () => null,
  dataSource = [],
  loading,
  total,
  pageSize,
  pageNum,
  field,
  order,
  searchVal,
  poolType,
}: {
  getData?: (args: FetchParam) => void;
  dataSource?: PairItem[];
  loading?: boolean;
  total?: number;
  pageSize?: number;
  pageNum?: number;
  field?: string | null;
  order?: SortOrder;
  searchVal?: string;
  poolType?: string;
}) => {
  return (
    <div className="capital-pool-wrap">
      <PairHeader getData={getData} searchVal={searchVal} />
      <PairsList
        dataSource={dataSource}
        getData={getData}
        loading={loading}
        total={total}
        pageSize={pageSize}
        pageNum={pageNum}
        field={field}
        order={order}
        poolType={poolType}
      />
    </div>
  );
};
export default PcPairList;
