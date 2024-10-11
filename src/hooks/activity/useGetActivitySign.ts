import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { APP_NAME } from 'config/webLoginConfig';
import { useCallback } from 'react';
import AElf from 'utils/aelf';
import { recoverPubKeyBySignature } from '@etransfer/utils';

export const useGetActivitySign = () => {
  const { getSignature, walletType, walletInfo } = useConnectWallet();

  return useCallback(
    async (plainTextOrigin: string) => {
      if (!walletInfo) throw new Error('You are not logged in.');
      const plainText: any = Buffer.from(plainTextOrigin).toString('hex').replace('0x', '');

      let signResult: {
        error: number;
        errorMessage: string;
        signature: string;
        from: string;
      } | null;

      if (walletType === WalletTypeEnum.discover) {
        // discover
        const discoverInfo = walletInfo?.extraInfo as any;
        if ((discoverInfo?.provider as any).methodCheck('wallet_getManagerSignature')) {
          const sin = await discoverInfo?.provider?.request({
            method: 'wallet_getManagerSignature',
            payload: { hexData: plainText },
          });
          const signInfo = [
            sin.r.toString('hex', 32),
            sin.s.toString('hex', 32),
            `0${sin.recoveryParam.toString()}`,
          ].join('');
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
        // portkey sdk
        const signInfo = Buffer.from(plainText).toString('hex');
        signResult = await getSignature({
          appName: APP_NAME,
          address: walletInfo.address,
          signInfo,
        });
      }

      if (signResult?.error) throw signResult.errorMessage;

      return {
        signature: signResult?.signature || '',
        plainText: plainTextOrigin,
        pubkey: recoverPubKeyBySignature(plainText, signResult?.signature || '') + '',
      };
    },
    [getSignature, walletInfo, walletType],
  );
};
