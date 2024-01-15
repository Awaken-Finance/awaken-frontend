import { Currency } from '@awaken/sdk-core';
import { basicActions } from 'contexts/utils';
import { ReactNode } from 'react';
import { Token } from 'types';

const modalActions = {
  setWalletModal: 'SET_WALLET_MODAL',
  setAccountModal: 'SET_ACCOUNT_MODAL',
  setNetWorkDrawer: 'SET_NETWORK_DRAWER',
  setSelectTokenModal: 'SET_SELECT_TOKEN_MODAL',
  setManageModal: 'SET_MANAGE_MODAL',
  setCreatePairModal: 'SET_CREATE_PAIR_MODAL',
  setManageLiquidityModal: 'SET_MANAGE_LIQUIDITY_MODAL',
  setTransactionSettingsModal: 'SET_TRANSACTION_SETTINGS_MODAL',
  setImportTokenModal: 'SET_IMPORT_TOKEN_MODAL',
  setTooltipModal: 'SET_TOOLTIP_MODAL',
  setExpertModeModal: 'SET_EXPERT_MODE_MODAL',
  destroy: 'DESTROY',
  setSynchronizedAccountInfoModal: 'SET_SYNCHRONIZED_ACCOUNT_MODAL',
};

export type PairInfo = {
  tokenA?: Currency;
  tokenB?: Currency;
  feeRate?: string;
};

export type TransactionSettingsModalPosition = {
  centered?: boolean;
  top?: number;
  right?: number;
};

export type modalState = {
  walletModal: boolean;
  netWorkDrawer: boolean;
  accountModal: boolean;
  selectTokenModal: boolean;
  manageModal: boolean;
  createPairModal: boolean;
  manageLiquidityModal: boolean;
  transactionSettingsModal: boolean;
  transactionSettingsModalPosition: TransactionSettingsModalPosition;
  importTokenModal: boolean;
  expertModeModal: boolean;

  tokenCallBack?: (token: Currency) => void;
  pairInfo?: PairInfo;
  defaultManageLiquidityKey?: 'add' | 'remove';
  selectedToken?: Currency;
  addToken?: Token;
  leftCallBack?: () => void;
  defaultManageKey?: 'lists' | 'tokens';
  ToolTip?: {
    title?: ReactNode;
    buttonTitle?: ReactNode;
    headerDesc?: ReactNode;
  };

  synchronizedAccountInfoModal: boolean;
};

export const basicModalView = {
  setWalletModal: {
    type: modalActions['setWalletModal'],
    actions: (walletModal: boolean) =>
      basicActions(modalActions['setWalletModal'], {
        walletModal,
        destroy: true,
      }),
  },
  setAccountModal: {
    type: modalActions['setAccountModal'],
    actions: (accountModal: boolean) =>
      basicActions(modalActions['setAccountModal'], {
        accountModal,
        destroy: true,
      }),
  },
  setNetWorkDrawer: {
    type: modalActions['setNetWorkDrawer'],
    actions: (netWorkDrawer: boolean) => basicActions(modalActions['setNetWorkDrawer'], { netWorkDrawer }),
  },
  setSelectTokenModal: {
    type: modalActions['setSelectTokenModal'],
    actions: (
      selectTokenModal: boolean,
      tokenCallBack?: modalState['tokenCallBack'],
      selectedToken?: modalState['selectedToken'],
    ) =>
      basicActions(modalActions['setSelectTokenModal'], {
        selectTokenModal,
        tokenCallBack,
        selectedToken,
      }),
  },
  setManageModal: {
    type: modalActions['setManageModal'],
    actions: (manageModal: boolean, defaultManageKey?: modalState['defaultManageKey']) =>
      basicActions(modalActions['setManageModal'], {
        manageModal,
        defaultManageKey,
      }),
  },
  setCreatePairModal: {
    type: modalActions['setCreatePairModal'],
    actions: (createPairModal: boolean) => basicActions(modalActions['setCreatePairModal'], { createPairModal }),
  },
  setManageLiquidityModal: {
    type: modalActions['setManageLiquidityModal'],
    actions: (
      manageLiquidityModal: boolean,
      pairInfo?: modalState['pairInfo'],
      defaultManageLiquidityKey?: modalState['defaultManageLiquidityKey'],
    ) =>
      basicActions(modalActions['setManageLiquidityModal'], {
        manageLiquidityModal,
        pairInfo,
        defaultManageLiquidityKey, // add remove
      }),
  },
  setTransactionSettingsModal: {
    type: modalActions['setTransactionSettingsModal'],
    actions: (
      transactionSettingsModal: boolean,
      transactionSettingsModalPosition: TransactionSettingsModalPosition | undefined = undefined,
    ) =>
      basicActions(modalActions['setTransactionSettingsModal'], {
        transactionSettingsModal,
        transactionSettingsModalPosition,
      }),
  },
  setImportTokenModal: {
    type: modalActions['setImportTokenModal'],
    actions: (
      importTokenModal: boolean,
      addToken?: modalState['addToken'],
      leftCallBack?: modalState['leftCallBack'],
      tokenCallBack?: modalState['tokenCallBack'],
    ) =>
      basicActions(modalActions['setImportTokenModal'], {
        importTokenModal,
        addToken,
        leftCallBack,
        tokenCallBack,
      }),
  },
  setTooltipModal: {
    type: modalActions['setTooltipModal'],
    actions: (ToolTip?: modalState['ToolTip']) => {
      return basicActions(modalActions['setTooltipModal'], {
        ToolTip,
      });
    },
  },
  setExpertModeModal: {
    type: modalActions['setExpertModeModal'],
    actions: (expertModeModal: boolean) => {
      return basicActions(modalActions['setTooltipModal'], {
        expertModeModal,
      });
    },
  },
  destroy: {
    type: modalActions['destroy'],
    actions: () => basicActions(modalActions['destroy']),
  },

  setSynchronizedAccountInfoModal: {
    type: modalActions['setSynchronizedAccountInfoModal'],
    actions: (synchronizedAccountInfoModal: boolean) => {
      console.log('setSynchronizedAccountInfoModal');

      return basicActions(modalActions['setSynchronizedAccountInfoModal'], {
        synchronizedAccountInfoModal,
      });
    },
  },
};
