import { useUser } from 'contexts/useUser';
import { addFavs, removeFavs, AddFavsResponse } from '../apis/getFavList';
import { IsCAWallet } from 'utils/wallet';
import { useCallback, useMemo } from 'react';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

export function useFavs() {
  const { walletType, walletInfo } = useConnectWallet();

  const [, { favListChange, getFavList, setFavChangeItem }] = useUser();

  const localSave = useCallback(
    (id: string) => {
      favListChange({
        address: walletInfo?.address,
        id,
      });
    },
    [favListChange, walletInfo?.address],
  );

  const serverSave = useCallback(
    async ({
      favId,
      isFav,
      id,
    }: {
      favId?: string | null;
      isFav?: boolean;
      id: string;
    }): Promise<AddFavsResponse | null> => {
      if (isFav) {
        await removeFavs({ id: favId });
        return null;
      } else {
        const data = await addFavs({ tradePairId: id, address: walletInfo?.address });
        return data;
      }
    },
    [walletInfo?.address],
  );

  const setFavs = useCallback(
    async ({
      favId,
      isFav,
      id,
    }: {
      favId?: string | null;
      isFav?: boolean;
      id: string;
    }): Promise<AddFavsResponse | null> => {
      setFavChangeItem({ id, address: walletInfo?.address, isFav: !isFav });

      if (IsCAWallet(walletType)) {
        const data = await serverSave({ favId, isFav, id });
        setFavChangeItem({ id, address: walletInfo?.address, isFav: !isFav, favId: data?.id || null });
        return data;
      } else {
        localSave(id);
        return null;
      }
    },
    [localSave, serverSave, setFavChangeItem, walletInfo?.address, walletType],
  );

  return useMemo(
    () => [{ favlist: getFavList(walletInfo?.address || '') }, { setFavs }],
    [getFavList, setFavs, walletInfo?.address],
  );
}
