import { TWalletInfo, WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { getCaHashAndOriginChainIdByWallet } from './wallet';

export const ETRANSFER_USER_INFO_STORE_KEY = 'ETRANSFER_USER_INFO_STORE_KEY';

export type TETransferUserInfo = {
  address: string;
  caHash: string;
  originChainId: string;
};
export const getStoreETransferUserInfo = () => {
  try {
    const infoStr = localStorage.getItem(ETRANSFER_USER_INFO_STORE_KEY);
    const info: TETransferUserInfo = JSON.parse(infoStr || '');
    return info;
  } catch (error) {
    return undefined;
  }
};

export const setStoreETransferUserInfo = (info: TETransferUserInfo) => {
  try {
    localStorage.setItem(ETRANSFER_USER_INFO_STORE_KEY, JSON.stringify(info));
  } catch (error) {
    console.log('setStoreETransferUserInfo error', error);
  }
};

export const getETransferUserInfo = async (walletInfo: TWalletInfo, walletType: WalletTypeEnum) => {
  if (!walletInfo) throw new Error('Failed to obtain wallet information: getETransferUserInfo');
  const address = walletInfo.address;
  const info = getStoreETransferUserInfo();
  if (info && info.address === address) return info;

  const { caHash, originChainId } = await getCaHashAndOriginChainIdByWallet(walletInfo, walletType);
  const _info: TETransferUserInfo = {
    address,
    caHash,
    originChainId,
  };
  setStoreETransferUserInfo(_info);
  return _info;
};
