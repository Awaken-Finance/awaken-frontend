import AElf from 'utils/aelf';
import { useCallback, useEffect, useRef } from 'react';
import { etransferEvents, recoverPubKeyBySignature, resetETransferJWT, removeELFAddressSuffix } from '@etransfer/utils';
import { AuthTokenSource, PortkeyVersion } from '@etransfer/types';

import { ETransferConfig, getETransferReCaptcha, WalletTypeEnum, etransferCore } from '@etransfer/ui-react';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

import { getManagerAddressByWallet } from 'utils/wallet';
import { useIsConnected } from './useLogin';
import { APP_NAME } from 'config/webLoginConfig';
import { TWalletType } from '@etransfer/types';
import { useGetAccount } from './wallet';
import { getETransferUserInfo } from 'utils/etransfer';

export type TSetETransferConfigParams = {
  managerAddress: string;
  caHash: string;
  jwt: string;
  isDeposit?: boolean;
};
export function useETransferAuthToken() {
  const { getSignature, walletType, walletInfo, callSendMethod } = useConnectWallet();
  const isLogin = useIsConnected();
  const isLoginRef = useRef(isLogin);
  isLoginRef.current = isLogin;
  const accounts = useGetAccount();

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

  const setETransferConfig = useCallback(
    ({ managerAddress, caHash, jwt, isDeposit = true }: TSetETransferConfigParams) => {
      if (isDeposit) {
        ETransferConfig.setConfig({
          authorization: {
            jwt,
          },
        });
        return;
      }

      const ownerAddress = walletInfo?.address || '';
      if (!accounts) return;
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
          walletType: walletType,
          accounts: accounts,
          managerAddress: walletType === WalletTypeEnum.elf ? ownerAddress : managerAddress,
          caHash: caHash,
        },
        authorization: {
          jwt,
        },
      });
    },
    [accounts, callSendMethod, getSignature, walletInfo?.address, walletType],
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
        const source = walletType === WalletTypeEnum.elf ? AuthTokenSource.NightElf : AuthTokenSource.Portkey;
        const storageJwt = await etransferCore.getAuthTokenFromStorage({
          walletType: (source as unknown as TWalletType) || TWalletType.Portkey,
          caHash: caHash,
          managerAddress: managerAddress,
        });
        if (storageJwt) {
          setETransferConfigRef.current({
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
          recaptchaToken: walletType === WalletTypeEnum.elf ? recaptchaToken : undefined,
        });

        setETransferConfigRef.current({
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
