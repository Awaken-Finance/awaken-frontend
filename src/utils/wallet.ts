import { TWalletInfo, WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { GetCAHolderByManagerParams } from '@portkey/services';

import { did } from '@portkey/did';
import { TChainId } from '@aelf-web-login/wallet-adapter-base';
import { DEFAULT_CHAIN } from 'constants/index';
import { recoverManagerAddressByPubkey } from '@etransfer/utils';
import { getPortkeyWebWalletInfo } from './portkey';

export const getCaHashAndOriginChainIdByWallet = async (
  walletInfo: TWalletInfo,
  walletType: WalletTypeEnum,
): Promise<{ caHash: string; originChainId: TChainId }> => {
  if (walletType === WalletTypeEnum.unknown)
    return {
      caHash: '',
      originChainId: DEFAULT_CHAIN,
    };

  let caHash, originChainId;
  if (walletType === WalletTypeEnum.discover) {
    const res = await did.services.getHolderInfoByManager({
      caAddresses: [walletInfo?.address],
    } as unknown as GetCAHolderByManagerParams);
    const caInfo = res[0];
    caHash = caInfo?.caHash;
    originChainId = caInfo?.chainId as TChainId;
  } else if (walletType === WalletTypeEnum.web) {
    const _sdkWalletInfo = getPortkeyWebWalletInfo();
    console.log(_sdkWalletInfo, '===_sdkWalletInfo');

    caHash = _sdkWalletInfo?.caHash;
    originChainId = _sdkWalletInfo?.originChainId;
  }

  return {
    caHash: caHash || '',
    originChainId: originChainId || DEFAULT_CHAIN,
  };
};

export const getManagerAddressByWallet = async (
  walletInfo: TWalletInfo,
  walletType: WalletTypeEnum,
  pubkey?: string,
): Promise<string> => {
  if (walletType === WalletTypeEnum.unknown) return '';
  let managerAddress;
  if (walletType === WalletTypeEnum.discover) {
    const discoverInfo = walletInfo?.extraInfo as any;
    managerAddress = await discoverInfo?.provider?.request({
      method: 'wallet_getCurrentManagerAddress',
    });
  } else if (walletType === WalletTypeEnum.web) {
    const _sdkWalletInfo = getPortkeyWebWalletInfo();
    managerAddress = _sdkWalletInfo?.managerAddress;
  } else {
    // WalletTypeEnum.elf
    managerAddress = walletInfo?.address;
  }
  if (!managerAddress && pubkey) {
    managerAddress = recoverManagerAddressByPubkey(pubkey);
  }
  return managerAddress || '';
};

export const IsCAWallet = (walletType: WalletTypeEnum) =>
  [WalletTypeEnum.discover, WalletTypeEnum.web].includes(walletType);

export const getValidAddress = (str: string) => {
  const strArray = str.split('_');
  if (strArray.length === 1) return str;
  return strArray[1] || str;
};
