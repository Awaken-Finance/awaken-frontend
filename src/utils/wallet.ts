import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';

export const IsCAWallet = (walletType: WalletTypeEnum) =>
  [WalletTypeEnum.discover, WalletTypeEnum.aa].includes(walletType);
