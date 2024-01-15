import { WalletType } from 'aelf-web-login';

export const IsCAWallet = (walletType: WalletType) => ['discover', 'portkey'].includes(walletType);
