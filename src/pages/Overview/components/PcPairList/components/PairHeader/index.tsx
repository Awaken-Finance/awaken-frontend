import CreatePairBtn from 'Buttons/CreatePairBtn';
import SearchTairByName from 'components/SearchTairByName';
import TradingMeunList from 'components/TradingMeunList';

import { FetchParam } from 'types/requeset';

import './index.less';

export default function PairHeader({
  getData,
  searchVal,
}: {
  getData: (params: FetchParam) => void;
  searchVal?: string;
}) {
  return (
    <div className="flex justify-between title-menu">
      <TradingMeunList onChange={getData} source="market" />
      <div className="menu-right">
        <div className="search">
          <SearchTairByName value={searchVal} onChange={(searchVal) => getData({ searchVal })} />
        </div>
        <CreatePairBtn useBtn />
      </div>
    </div>
  );
}
