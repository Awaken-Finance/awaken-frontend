import { useCallback, useMemo, useState } from 'react';
import { IsCAWallet } from 'utils/wallet';
import { useUser } from 'contexts/useUser';
import { getUserAssetToken, setUserAssetToken } from 'pages/UserCenter/apis/assetOverview';
import { useAsyncEffect } from 'ahooks';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

export default function usePriceType() {
  const { walletType, walletInfo } = useConnectWallet();
  const [, { getAssetTotalSymbol, setAssetTotalSymbol }] = useUser();

  const [assetSymbol, setAssetSymbol] = useState<string>('');

  const isCAWallet = useMemo(() => IsCAWallet(walletType), [walletType]);

  const savePriceType = useCallback(
    (symbol: string) => {
      if (assetSymbol === symbol) {
        return;
      }

      setAssetSymbol(symbol);

      if (!isCAWallet) {
        return setAssetTotalSymbol(walletInfo?.address || '', symbol);
      }

      setUserAssetToken({
        tokenSymbol: symbol,
        address: walletInfo?.address || '',
      });
    },
    [assetSymbol, isCAWallet, walletInfo?.address, setAssetTotalSymbol],
  );

  useAsyncEffect(async () => {
    let assetSymbol;
    if (!isCAWallet) {
      assetSymbol = getAssetTotalSymbol(walletInfo?.address || '');
    } else {
      const results = await getUserAssetToken(walletInfo?.address);
      assetSymbol = results?.tokenSymbol;
    }

    setAssetSymbol(assetSymbol ?? 'BTC');
  }, [walletInfo?.address]);

  return useMemo(() => [{ priceType: assetSymbol }, { savePriceType }], [assetSymbol, savePriceType]);
}
