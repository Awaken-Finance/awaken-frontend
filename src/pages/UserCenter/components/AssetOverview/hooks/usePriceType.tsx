import { useWebLogin } from 'aelf-web-login';
import { useCallback, useMemo, useState } from 'react';
import { IsCAWallet } from 'utils/wallet';
import { useUser } from 'contexts/useUser';
import { getUserAssetToken, setUserAssetToken } from 'pages/UserCenter/apis/assetOverview';
import { useAsyncEffect } from 'ahooks';

export default function usePriceType() {
  const { walletType, wallet } = useWebLogin();
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
        return setAssetTotalSymbol(wallet?.address, symbol);
      }

      setUserAssetToken({
        tokenSymbol: symbol,
        address: wallet?.address,
      });
    },
    [isCAWallet, assetSymbol, setAssetTotalSymbol, wallet?.address],
  );

  useAsyncEffect(async () => {
    let assetSymbol;
    if (!isCAWallet) {
      assetSymbol = getAssetTotalSymbol(wallet?.address);
    } else {
      const results = await getUserAssetToken(wallet?.address);
      assetSymbol = results?.tokenSymbol;
    }

    setAssetSymbol(assetSymbol ?? 'BTC');
  }, [wallet?.address]);

  return useMemo(() => [{ priceType: assetSymbol }, { savePriceType }], [assetSymbol, savePriceType]);
}
