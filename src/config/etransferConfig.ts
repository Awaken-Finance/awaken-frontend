import { ETransferConfigProps } from '@etransfer/ui-react';

const API_ENV = process.env.REACT_APP_API_ENV;

let networkType: ETransferConfigProps['networkType'] = 'MAINNET',
  etransferUrl: ETransferConfigProps['etransferUrl'] = 'https://app.etransfer.exchange',
  etransferAuthUrl: ETransferConfigProps['etransferAuthUrl'] = 'https://app.etransfer.exchange',
  etransferDepositConfig: ETransferConfigProps['depositConfig'] = {
    supportChainIds: ['tDVV'],
    defaultChainId: 'tDVV',
  },
  etransferWithdrawConfig: ETransferConfigProps['withdrawConfig'] = {
    supportChainIds: ['tDVV'],
    defaultChainId: 'tDVV',
  },
  depositDefaultNetwork = 'TRX';

switch (API_ENV) {
  case 'preview':
  case 'test':
  case 'local':
    networkType = 'TESTNET';
    etransferUrl = 'https://test-app.etransfer.exchange';
    etransferAuthUrl = 'https://test-app.etransfer.exchange';
    etransferDepositConfig = {
      supportChainIds: ['tDVW'],
      defaultChainId: 'tDVW',
    };
    etransferWithdrawConfig = {
      supportChainIds: ['tDVW'],
      defaultChainId: 'tDVW',
    };
    depositDefaultNetwork = 'SETH';
    break;
}

export const etransferConfig: Partial<ETransferConfigProps> = {
  networkType,
  etransferUrl,
  etransferAuthUrl,
  // depositConfig,
  // withdrawConfig,
};

export const ETRANSFER_DEPOSIT_CONFIG = etransferDepositConfig;
export const ETRANSFER_WITHDRAW_CONFIG = etransferWithdrawConfig;
export const ETRANSFER_DEPOSIT_DEFAULT_NETWORK = depositDefaultNetwork;
