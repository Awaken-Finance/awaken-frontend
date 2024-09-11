import { ETransferConfigProps } from '@etransfer/ui-react';

const API_ENV = process.env.REACT_APP_API_ENV;

let networkType: ETransferConfigProps['networkType'] = 'MAINNET',
  etransferUrl: ETransferConfigProps['etransferUrl'] = 'https://app.etransfer.exchange',
  etransferAuthUrl: ETransferConfigProps['etransferAuthUrl'] = 'https://app.etransfer.exchange',
  depositConfig: ETransferConfigProps['depositConfig'] = {
    supportChainIds: ['tDVV'],
    defaultChainId: 'tDVV',
  },
  withdrawConfig: ETransferConfigProps['withdrawConfig'] = {
    supportChainIds: ['tDVV'],
    defaultChainId: 'tDVV',
  };

switch (API_ENV) {
  case 'preview':
  case 'test':
  case 'local':
    networkType = 'TESTNET';
    etransferUrl = 'https://test-app.etransfer.exchange';
    etransferAuthUrl = 'https://test-app.etransfer.exchange';
    depositConfig = {
      supportChainIds: ['tDVW'],
      defaultChainId: 'tDVW',
    };
    withdrawConfig = {
      supportChainIds: ['tDVW'],
      defaultChainId: 'tDVW',
    };
    break;
}

export const etransferConfig: Partial<ETransferConfigProps> = {
  networkType,
  etransferUrl,
  etransferAuthUrl,
  depositConfig,
  withdrawConfig,
};
