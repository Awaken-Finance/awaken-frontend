import { memo } from 'react';

import PcPairList from './components/PcPairList';
import MobilePairList from './components/MobilePairList';
import { useMobile } from 'utils/isMobile';
import useSearchPairList from './hooks/useSearchPairList';
import { useOVContext } from './hooks/useOverview';

import './Overview.less';

const Overview = () => {
  const isMobile = useMobile();

  const [{ socket }] = useOVContext();
  const [{ dataSource, loading, total, pageInfo }, { getData }] = useSearchPairList(
    {
      page: 2,
    },
    {
      socket,
      customPageSize: isMobile ? 50 : 20,
      scrollLoad: isMobile,
    },
  );

  const renderContent = () => {
    if (isMobile) {
      return (
        <MobilePairList
          dataSource={dataSource}
          loading={loading}
          total={total}
          getData={getData}
          {...pageInfo}
          pageSize={50}
        />
      );
    }

    return <PcPairList dataSource={dataSource} loading={loading} total={total} getData={getData} {...pageInfo} />;
  };

  return <main className="overview">{renderContent()}</main>;
};

export default memo(Overview);
