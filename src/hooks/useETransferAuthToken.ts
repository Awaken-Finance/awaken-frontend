import AElf from 'utils/aelf';
import { useCallback, useEffect, useRef } from 'react';
import {
  etransferEvents,
  recoverPubKeyBySignature,
  resetETransferJWT,
  removeELFAddressSuffix,
  SignatureData,
} from '@etransfer/utils';
import { AuthTokenSource, PortkeyVersion } from '@etransfer/types';

import { ETransferConfig, getETransferReCaptcha, etransferCore } from '@etransfer/ui-react';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

import { getManagerAddressByWallet } from 'utils/wallet';
import { useIsConnected } from './useLogin';
import { APP_NAME } from 'config/webLoginConfig';
import { TWalletType } from '@etransfer/types';
import { useGetAccount } from './wallet';
import { getETransferUserInfo } from 'utils/etransfer';
import { isEOA, sleep } from 'utils';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import detectProvider from '@portkey/detect-provider';
import { zeroFill } from '@portkey/utils';

export type TSetETransferConfigParams = {
  managerAddress: string;
  caHash: string;
  jwt: string;
  isDeposit?: boolean;
};

export function useGetTransactionSignature() {
  const { walletInfo, walletType, getSignature } = useConnectWallet();

  return useCallback(
    async (signInfo: any): Promise<SignatureData | null> => {
      const ownerAddress = walletInfo?.address;
      let signatureResult: SignatureData | null = {
        error: 0,
        errorMessage: '',
        signature: '',
        from: '',
      };
      if (!ownerAddress) return signatureResult;
      const isFairyVault = walletType === WalletTypeEnum.fairyVault;
      const isWebPortkey = walletType === WalletTypeEnum.web;

      console.log(isWebPortkey, '====isWebPortkey');

      const isDiscover = walletType === WalletTypeEnum.discover;
      if (isDiscover || isFairyVault || isWebPortkey) {
        // discover
        signatureResult.from = WalletTypeEnum.discover;

        // discover and FairyVault
        let provider: any = (walletInfo?.extraInfo as any)?.provider;
        if (isFairyVault) {
          provider = await detectProvider({ providerName: 'FairyVault' as any });
        } else if (isWebPortkey) {
          provider = await detectProvider({ providerName: 'PortkeyWebWallet' as any });
        }

        if (provider?.methodCheck?.('wallet_getTransactionSignature') || isFairyVault || isWebPortkey) {
          console.log(provider, '======provider');

          const sin = await provider?.request({
            method: 'wallet_getTransactionSignature',
            payload: { hexData: signInfo },
          });
          signatureResult.signature = [zeroFill(sin.r), zeroFill(sin.s), `0${sin.recoveryParam.toString()}`].join('');
        } else {
          const signatureRes = await getSignature({
            appName: APP_NAME,
            address: removeELFAddressSuffix(ownerAddress),
            signInfo,
          });
          signatureResult.signature = signatureRes?.signature || '';
        }
      } else {
        const signatureRes = await getSignature({
          appName: APP_NAME,
          address: removeELFAddressSuffix(ownerAddress),
          signInfo,
        });
        signatureResult = signatureRes;
      }
      return signatureResult;
    },
    [getSignature, walletInfo, walletType],
  );
}

export function useETransferAuthToken() {
  const { getSignature, walletType, walletInfo, callSendMethod } = useConnectWallet();
  const getTransactionSignature = useGetTransactionSignature();

  const isLogin = useIsConnected();
  const isLoginRef = useRef(isLogin);
  isLoginRef.current = isLogin;
  const accounts = useGetAccount();

  const handleGetSignature = useCallback(async () => {
    if (!walletInfo) return;
    const plainTextOrigin = `Welcome to ETransfer!

Click to sign in and accept the ETransfer Terms of Service (https://etransfer.gitbook.io/docs/more-information/terms-of-service) and Privacy Policy (https://etransfer.gitbook.io/docs/more-information/privacy-policy).

This request will not trigger a blockchain transaction or cost any gas fees.

Nonce:
${Date.now()}`;
    const plainText: any = Buffer.from(plainTextOrigin).toString('hex').replace('0x', '');
    let signResult: {
      error: number;
      errorMessage: string;
      signature: string;
      from: string;
    } | null;

    const isFairyVault = walletType === WalletTypeEnum.fairyVault;
    const isDiscover = walletType === WalletTypeEnum.discover;
    if (isDiscover || isFairyVault) {
      // discover

      let provider: any = (walletInfo?.extraInfo as any)?.provider;
      if (isFairyVault) {
        provider = await detectProvider({ providerName: 'FairyVault' as any });
      }
      if (provider?.methodCheck('wallet_getManagerSignature')) {
        const sin = await provider?.request({
          method: 'wallet_getManagerSignature',
          payload: { hexData: plainText },
        });
        const signInfo = [zeroFill(sin.r), zeroFill(sin.s), `0${sin.recoveryParam.toString()}`].join('');
        signResult = {
          error: 0,
          errorMessage: '',
          signature: signInfo,
          from: WalletTypeEnum.discover,
        };
      } else {
        const signInfo = AElf.utils.sha256(plainText);
        signResult = await getSignature({
          appName: APP_NAME,
          address: walletInfo.address,
          signInfo,
        });
      }
    } else if (walletType === WalletTypeEnum.elf) {
      // nightElf
      const signInfo = AElf.utils.sha256(plainText);
      signResult = await getSignature({
        appName: APP_NAME,
        address: walletInfo.address,
        signInfo,
      });
    } else {
      // portkey web wallet
      const signInfo = plainText;
      signResult = await getSignature({
        appName: APP_NAME,
        address: walletInfo.address,
        signInfo,
      });
    }

    if (signResult?.error) throw signResult.errorMessage;

    return { signature: signResult?.signature || '', plainText };
  }, [getSignature, walletInfo, walletType]);

  const getUserInfo = useCallback(async () => {
    if (!walletInfo) throw new Error('Failed to obtain wallet information.');
    if (!isLoginRef.current) throw new Error('You are not logged in.');

    try {
      const { caHash, originChainId } = await getETransferUserInfo(walletInfo, walletType);
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
      console.log(error, '=====getUserInfo');

      throw new Error('Failed to obtain user information');
    }
  }, [walletInfo, walletType]);

  const getSignatureInfo = useCallback(
    async (isCheckReCaptcha = true) => {
      if (!walletInfo) throw new Error('Failed to obtain wallet information.');
      if (!isLoginRef.current) throw new Error('You are not logged in.');
      let reCaptchaToken = undefined;
      if (isCheckReCaptcha && isEOA(walletType)) {
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

  const setETransferConfig = useCallback(
    async ({ managerAddress, caHash, jwt, isDeposit = true }: TSetETransferConfigParams) => {
      if (!accounts) return;

      await sleep(100);
      const ownerAddress = walletInfo?.address || '';

      ETransferConfig.setConfig({
        accountInfo: {
          tokenContractCallSendMethod: (params) => {
            const paramsFormat: any = params;
            paramsFormat.args['networkType'] = ETransferConfig.getConfig('networkType');
            return callSendMethod(params);
          },
          getSignature: (signInfo) =>
            getSignature({
              signInfo,
              appName: APP_NAME,
              address: removeELFAddressSuffix(ownerAddress),
            }),
          getTransactionSignature: (signInfo) => getTransactionSignature(signInfo),
          // TODO: Update etransfer SDK
          walletType: walletType as any,
          accounts: accounts,
          managerAddress: isEOA(walletType) ? ownerAddress : managerAddress,
          caHash: caHash,
        },
        authorization: {
          jwt,
        },
      });
    },
    [accounts, callSendMethod, getSignature, getTransactionSignature, walletInfo?.address, walletType],
  );
  const setETransferConfigRef = useRef(setETransferConfig);
  setETransferConfigRef.current = setETransferConfig;

  const isSignedRef = useRef(false);
  const getAuthToken = useCallback(
    async (isDeposit = true) => {
      if (!walletInfo) throw new Error('Failed to obtain wallet information.');
      if (!isLoginRef.current) throw new Error('You are not logged in.');
      try {
        const { caHash, managerAddress, originChainId } = await getUserInfo();

        // 1: local storage has JWT token
        const source = isEOA(walletType) ? AuthTokenSource.NightElf : AuthTokenSource.Portkey;
        const storageJwt = await etransferCore.getAuthTokenFromStorage({
          walletType: (source as unknown as TWalletType) || TWalletType.Portkey,
          caHash: caHash,
          managerAddress: managerAddress,
        });
        if (storageJwt) {
          await setETransferConfigRef.current({
            caHash,
            managerAddress,
            jwt: storageJwt,
            isDeposit,
          });
          isSignedRef.current = true;
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
          recaptchaToken: isEOA(walletType) ? recaptchaToken : undefined,
        });

        await setETransferConfigRef.current({
          caHash,
          managerAddress,
          jwt,
          isDeposit,
        });
        isSignedRef.current = true;
      } catch (error) {
        throw error || new Error('Failed to obtain etransfer authorization.');
      }
    },
    [getSignatureInfo, getUserInfo, walletInfo, walletType],
  );

  const getAuthTokenRef = useRef(getAuthToken);
  getAuthTokenRef.current = getAuthToken;

  useEffect(() => {
    const { remove } = etransferEvents.DeniedRequest.addListener(() => {
      console.log('ETransfer DeniedRequest');
      if (!isSignedRef.current) return;
      etransferCore.storage && resetETransferJWT(etransferCore.storage);
      getAuthTokenRef.current();
    });
    return () => {
      remove();
    };
  }, []);

  return { getAuthToken, getUserInfo };
}
