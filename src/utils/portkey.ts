import { TChainId, WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';

export function checkConnectedWallet(type = WalletTypeEnum.aa) {
  try {
    if (localStorage.getItem('connectedWallet') === type) localStorage.removeItem('connectedWallet');
  } catch (error) {
    console.log(error, '====checkConnectedWallet');
  }
}

export type TPortkeyWebWalletWalletInfo = {
  caAddress: string;
  caHash: string;
  managerAddress: string;
  managerPubkey: string;
  originChainId: TChainId;
};

export function getPortkeyWebWalletInfo() {
  const portkeyWebWalletInfo = localStorage.getItem('PortkeyWebWalletWalletInfo');
  if (!portkeyWebWalletInfo) return;
  try {
    return JSON.parse(portkeyWebWalletInfo) as TPortkeyWebWalletWalletInfo;
  } catch (error) {
    return;
  }
}
