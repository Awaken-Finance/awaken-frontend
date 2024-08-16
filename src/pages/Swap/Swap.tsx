import { useTranslation } from 'react-i18next';
import SettingFee from 'Buttons/SettingFeeBtn';
import { CommonPanelPage } from 'components/CommonPanelPage';
import { useIsTelegram, useMobile } from 'utils/isMobile';
import { SwapPanel } from './components/SwapPanel';

import './styles.less';
import { SwapHistory } from './components/SwapHistory';
import { useGoBack } from 'hooks/route';
import { useIsConnected } from 'hooks/useLogin';
import { useState } from 'react';
import clsx from 'clsx';
import { LimitPanel } from './components/LimitPanel';
import { useRouteMatch } from 'react-router-dom';

enum SwapTabEnum {
  swap = 1,
  limit,
}
const SWAP_TAB_LIST = [
  {
    value: SwapTabEnum.swap,
    label: 'Swap',
  },
  {
    value: SwapTabEnum.limit,
    label: 'Limit',
  },
];

export const Swap = () => {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const isTelegram = useIsTelegram();
  const isConnected = useIsConnected();
  const goBack = useGoBack();
  const match = useRouteMatch<{ tab: string }>('/swap/:tab');
  const { tab: routeTab } = match?.params || {};
  const [tab, setTab] = useState(SwapTabEnum[routeTab as keyof typeof SwapTabEnum] ?? SwapTabEnum.swap);

  return (
    <>
      <CommonPanelPage
        className="swap-page"
        onCancel={goBack}
        title={() => (
          <div className="swap-page-title">
            {SWAP_TAB_LIST.map((item) => (
              <div
                className={clsx(['swap-page-title-btn', item.value === tab && 'swap-page-title-btn-active'])}
                key={item.value}
                onClick={() => {
                  setTab(item.value);
                }}>
                {t(item.label)}
                <div className="swap-page-title-btn-border" />
              </div>
            ))}
          </div>
        )}
        extraTitle={<SettingFee />}
        isCancelHide={!isMobile || isTelegram}>
        {tab === SwapTabEnum.swap ? <SwapPanel /> : <></>}
        {tab === SwapTabEnum.limit ? <LimitPanel /> : <></>}
      </CommonPanelPage>

      {isConnected && tab === SwapTabEnum.swap && <SwapHistory />}
    </>
  );
};
