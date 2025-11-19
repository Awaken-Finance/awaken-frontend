import {
  ETransferConfig,
  ETransferDepositProvider,
  ETransferLayoutProvider,
  ETransferStyleProvider,
  ETransferWithdrawProvider,
  WalletTypeEnum,
  unsubscribeUserOrderRecord,
} from '@etransfer/ui-react';
import '@etransfer/ui-react/dist/assets/index.css';
import { CommonPanelPage } from 'components/CommonPanelPage';
import { useETransferAuthToken } from 'hooks/useETransferAuthToken';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './styles.less';
import clsx from 'clsx';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useIsTelegram, useMobile } from 'utils/isMobile';
import { useEffectOnce } from 'react-use';
import { useGoBack } from 'hooks/route';
import CommonLink from 'components/CommonLink';
import { TDepositActionData } from '@etransfer/ui-react/dist/_types/src/components/Deposit/types';
import { stringify, parseUrl } from 'query-string';
import { DEFAULT_CHAIN } from 'constants/index';
import {
  ETRANSFER_DEPOSIT_CONFIG,
  ETRANSFER_DEPOSIT_DEFAULT_NETWORK,
  ETRANSFER_WITHDRAW_CONFIG,
} from 'config/etransferConfig';
import { TWithdrawActionData } from '@etransfer/ui-react/dist/_types/src/components/Withdraw/types';
import { ETransferContentBody } from './components/ETransferContentBody';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

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
  const [isConfigInit, setIsConfigInit] = useState(false);

  const historyRouter = useHistory();
  const changeTab = useCallback(
    (key: DepositTabEnum) => {
      if (key === DepositTabEnum.deposit) {
        historyRouter.push(`/deposit`);
      } else {
        historyRouter.push(`/withdraw`);
      }
    },
    [historyRouter],
  );
  const match = useRouteMatch<{ tab: string }>('/:tab');
  const { tab: routeTab } = match?.params || {};
  const tab = useMemo(
    () => DepositTabEnum[routeTab as keyof typeof DepositTabEnum] ?? DepositTabEnum.deposit,
    [routeTab],
  );

  const { walletInfo } = useConnectWallet();
  useEffect(() => {
    const address = walletInfo?.address || '';
    return () => {
      if (!address) return;
      unsubscribeUserOrderRecord(address);
      ETransferConfig.setConfig({
        accountInfo: {
          accounts: {},
          walletType: WalletTypeEnum.unknown,
        },
      });
    };
  }, [walletInfo?.address]);

  const init = useCallback(async () => {
    try {
      const url = window.location.href;
      const parsedQuery = parseUrl(url);
      const query: any = parsedQuery.query;

      const isDeposit = tab === DepositTabEnum.deposit;
      if (isDeposit) {
        ETransferConfig.setConfig({
          depositConfig: {
            ...ETRANSFER_DEPOSIT_CONFIG,
            defaultChainId: query.chainId || DEFAULT_CHAIN,
            defaultNetwork: query.network || ETRANSFER_DEPOSIT_DEFAULT_NETWORK,
            defaultDepositToken: query.depositToken || 'USDT',
            defaultReceiveToken: query.receiveToken || 'USDT',
          },
          withdrawConfig: {
            ...ETRANSFER_WITHDRAW_CONFIG,
            defaultChainId: DEFAULT_CHAIN,
            defaultToken: 'USDT',
          },
        });
      } else {
        ETransferConfig.setConfig({
          depositConfig: {
            ...ETRANSFER_DEPOSIT_CONFIG,
            defaultChainId: DEFAULT_CHAIN,
            defaultNetwork: ETRANSFER_DEPOSIT_DEFAULT_NETWORK,
            defaultDepositToken: 'USDT',
            defaultReceiveToken: 'USDT',
          },
          withdrawConfig: {
            ...ETRANSFER_WITHDRAW_CONFIG,
            defaultChainId: query.chainId || DEFAULT_CHAIN,
            defaultNetwork: query.network,
            defaultToken: query.token || 'USDT',
          },
        });
      }
      setIsConfigInit(true);

      await getAuthToken(isDeposit);
    } catch (error) {
      console.log(error, '=====error');

      // historyRouter.replace('/');
    }
  }, [getAuthToken, historyRouter, tab]);
  const initRef = useRef(init);
  initRef.current = init;

  useEffectOnce(() => {
    initRef.current();
  });

  const onHistoryClick = useCallback(() => {
    historyRouter.push('/deposit-history');
  }, [historyRouter]);

  const onDepositActionChange = useCallback((action: TDepositActionData) => {
    const urlParams = stringify({
      chainId: action.chainSelected,
      network: action.networkSelected,
      receiveToken: action.receiveSymbolSelected,
      depositToken: action.depositSymbolSelected,
    });

    history.replaceState(null, '', `?` + urlParams);
  }, []);

  const onWithdrawActionChange = useCallback((action: TWithdrawActionData) => {
    const urlParams = stringify({
      chainId: action.chainSelected,
      network: action.networkSelected,
      token: action.symbolSelected,
    });

    history.replaceState(null, '', `?` + urlParams);
  }, []);

  if (!isConfigInit) return <></>;

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
                <ETransferContentBody
                  isDeposit={tab === DepositTabEnum.deposit}
                  onDepositActionChange={onDepositActionChange}
                  onWithdrawActionChange={onWithdrawActionChange}
                />
              </ETransferWithdrawProvider>
            </ETransferDepositProvider>
          </ETransferLayoutProvider>
        </ETransferStyleProvider>
      </CommonPanelPage>
    </div>
  );
};
