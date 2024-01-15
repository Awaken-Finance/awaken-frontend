import OVProvider from './hooks/useOverview';
import Updater from './hooks/Updater';
import Overview from './Overview';
import { memo } from 'react';

function OVContainer() {
  return (
    <OVProvider>
      <Updater />
      <Overview />
    </OVProvider>
  );
}

export default memo(OVContainer);
