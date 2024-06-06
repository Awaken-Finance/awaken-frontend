import OVProvider from './hooks/useOverview';
import Updater from './hooks/Updater';
import Overview from './Overview';
import { memo } from 'react';
import './styles.less';
import { OverviewFooter } from './components/OverviewFooter';

function OVContainer() {
  return (
    <OVProvider>
      <Updater />
      <Overview />
      <OverviewFooter />
    </OVProvider>
  );
}

export default memo(OVContainer);
