import AElf from 'utils/aelf';
import { useCallback, useEffect, useRef } from 'react';
import { etransferEvents, recoverPubKeyBySignature, resetETransferJWT } from '@etransfer/utils';
import { AuthTokenSource, PortkeyVersion } from '@etransfer/types';

import { ETransferConfig, getETransferReCaptcha, WalletTypeEnum, etransferCore } from '@etransfer/ui-react';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

import { getCaHashAndOriginChainIdByWallet, getManagerAddressByWallet } from 'utils/wallet';
import { useIsConnected } from './useLogin';
import { APP_NAME } from 'config/webLoginConfig';
import { TWalletType } from '@etransfer/types';

export function useETransferAuthToken() {
  const { getSignature, walletType, walletInfo } = useConnectWallet();
  const isLogin = useIsConnected();
  const isLoginRef = useRef(isLogin);
  isLoginRef.current = isLogin;

  const handleGetSignature = useCallback(async () => {
    if (!walletInfo) return;
    const plainTextOrigin = `Nonce:${Date.now()}`;
    const plainText: any = Buffer.from(plainTextOrigin).toString('hex').replace('0x', '');
    let signInfo: string;
    if (walletType !== WalletTypeEnum.aa) {
      // nightElf or discover
      signInfo = AElf.utils.sha256(plainText);
    } else {
      // portkey sdk
      signInfo = Buffer.from(plainText).toString('hex');
    }
    console.log('getSignature');
    const result = await getSignature({
      appName: APP_NAME,
      address: walletInfo.address,
      signInfo,
    });
    if (result?.error) throw result.errorMessage;

    return { signature: result?.signature || '', plainText };
  }, [getSignature, walletInfo, walletType]);

  const getUserInfo = useCallback(async () => {
    if (!walletInfo) throw new Error('Failed to obtain wallet information.');
    if (!isLoginRef.current) throw new Error('You are not logged in.');

    try {
      const { caHash, originChainId } = await getCaHashAndOriginChainIdByWallet(walletInfo, walletType);
      const managerAddress = await getManagerAddressByWallet(walletInfo, walletType);
      console.log('etransferInfo', {
        caHash,
        originChainId,
        managerAddress,
      });

      return {
        caHash,
        originChainId,
        managerAddress: managerAddress,
      };
    } catch (error) {
      throw new Error('Failed to obtain user information');
    }
  }, [walletInfo, walletType]);

  const getSignatureInfo = useCallback(
    async (isCheckReCaptcha = true) => {
      if (!walletInfo) throw new Error('Failed to obtain wallet information.');
      if (!isLoginRef.current) throw new Error('You are not logged in.');
      let reCaptchaToken = undefined;
      if (isCheckReCaptcha && walletType === WalletTypeEnum.elf) {
        reCaptchaToken = await getETransferReCaptcha(walletInfo.address);
      }
      const signatureResult = await handleGetSignature();
      if (!signatureResult) throw Error('Signature error');
      const pubkey = recoverPubKeyBySignature(signatureResult.plainText, signatureResult.signature) + '';

      return {
        pubkey,
        signature: signatureResult.signature,
        plainText: signatureResult.plainText,
        recaptchaToken: reCaptchaToken || undefined,
      };
    },
    [handleGetSignature, walletInfo, walletType],
  );

  const getAuthToken = useCallback(async () => {
    if (!walletInfo) throw new Error('Failed to obtain wallet information.');
    if (!isLoginRef.current) throw new Error('You are not logged in.');
    try {
      const { caHash, managerAddress, originChainId } = await getUserInfo();

      // 1: local storage has JWT token
      const source = walletType === WalletTypeEnum.elf ? AuthTokenSource.NightElf : AuthTokenSource.Portkey;
      const storageJwt = await etransferCore.getAuthTokenFromStorage({
        walletType: (source as unknown as TWalletType) || TWalletType.Portkey,
        caHash: caHash,
        managerAddress: managerAddress,
      });
      if (storageJwt) {
        ETransferConfig.setConfig({
          authorization: {
            jwt: storageJwt,
          },
        });
        return;
      }

      const { pubkey, signature, plainText, recaptchaToken } = await getSignatureInfo();
      const jwt = await etransferCore.getAuthTokenFromApi({
        pubkey,
        signature,
        plain_text: plainText,
        ca_hash: caHash,
        chain_id: originChainId,
        managerAddress,
        version: PortkeyVersion.v2,
        source: source,
        recaptchaToken: walletType === WalletTypeEnum.elf ? recaptchaToken : undefined,
      });

      ETransferConfig.setConfig({
        authorization: {
          jwt,
        },
      });
    } catch (error) {
      throw error || new Error('Failed to obtain etransfer authorization.');
    }
  }, [getSignatureInfo, getUserInfo, walletInfo, walletType]);

  const getAuthTokenRef = useRef(getAuthToken);
  getAuthTokenRef.current = getAuthToken;

  useEffect(() => {
    const { remove } = etransferEvents.DeniedRequest.addListener(() => {
      console.log('ETransfer DeniedRequest');
      etransferCore.storage && resetETransferJWT(etransferCore.storage);
      getAuthTokenRef.current();
    });
    return () => {
      remove();
    };
  }, []);

  return { getAuthToken, getUserInfo };
}
