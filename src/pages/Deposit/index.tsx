import {
  ComponentStyle,
  Deposit,
  ETransferDepositProvider,
  ETransferLayoutProvider,
  ETransferStyleProvider,
  ETransferWithdrawProvider,
  Withdraw,
} from '@etransfer/ui-react';
import '@etransfer/ui-react/dist/assets/index.css';
import { CommonPanelPage } from 'components/CommonPanelPage';
import { useETransferAuthToken } from 'hooks/useETransferAuthToken';

import { useCallback, useMemo } from 'react';
import './styles.less';
import clsx from 'clsx';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useIsTelegram, useMobile } from 'utils/isMobile';
import { useEffectOnce } from 'react-use';
import { useGoBack } from 'hooks/route';
import CommonButton from 'components/CommonButton';
import CommonLink from 'components/CommonLink';

enum DepositTabEnum {
  deposit = 1,
  withdraw,
}
const DEPOSIT_TAB_LIST = [
  {
    value: DepositTabEnum.deposit,
    label: 'Deposit',
  },
  {
    value: DepositTabEnum.withdraw,
    label: 'Withdraw',
  },
];

export default () => {
  const { t } = useTranslation();
  const { getAuthToken } = useETransferAuthToken();
  const isMobile = useMobile();
  const isTelegram = useIsTelegram();
  const goBack = useGoBack();

  const history = useHistory();
  const changeTab = useCallback(
    (key: DepositTabEnum) => {
      if (key === DepositTabEnum.deposit) {
        history.push(`/deposit`);
      } else {
        history.push(`/withdraw`);
      }
    },
    [history],
  );
  const match = useRouteMatch<{ tab: string }>('/:tab');
  const { tab: routeTab } = match?.params || {};
  const tab = useMemo(
    () => DepositTabEnum[routeTab as keyof typeof DepositTabEnum] ?? DepositTabEnum.deposit,
    [routeTab],
  );

  useEffectOnce(() => {
    console.log('effect init');
    getAuthToken(tab === DepositTabEnum.deposit);
  });

  const onHistoryClick = useCallback(() => {
    history.push('/deposit-history');
  }, [history]);

  return (
    <div className="deposit-page">
      <CommonPanelPage
        onCancel={goBack}
        isCancelHide={!isMobile || isTelegram}
        title={() => (
          <div className="deposit-page-title">
            {DEPOSIT_TAB_LIST.map((item) => (
              <div
                className={clsx(['deposit-page-title-btn', item.value === tab && 'deposit-page-title-btn-active'])}
                key={item.value}
                onClick={() => {
                  changeTab(item.value);
                }}>
                {t(item.label)}
                <div className="deposit-page-title-btn-border" />
              </div>
            ))}
          </div>
        )}
        extraTitle={
          <CommonLink
            className="deposit-history-btn"
            size={14}
            lineHeight={22}
            color="two"
            iconProps={{ color: 'two' }}
            onClick={onHistoryClick}>
            {t('History')}
          </CommonLink>
        }>
        <ETransferStyleProvider>
          <ETransferLayoutProvider>
            <ETransferDepositProvider>
              <ETransferWithdrawProvider>
                {tab === DepositTabEnum.deposit ? (
                  <Deposit
                    componentStyle={isMobile ? ComponentStyle.Mobile : ComponentStyle.Web}
                    isListenNoticeAuto={false}
                    isShowProcessingTip={false}
                  />
                ) : (
                  <Withdraw
                    componentStyle={isMobile ? ComponentStyle.Mobile : ComponentStyle.Web}
                    isListenNoticeAuto={false}
                    isShowProcessingTip={false}
                  />
                )}
              </ETransferWithdrawProvider>
            </ETransferDepositProvider>
          </ETransferLayoutProvider>
        </ETransferStyleProvider>
      </CommonPanelPage>
    </div>
  );
};
