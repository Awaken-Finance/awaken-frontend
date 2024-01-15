import { useUser } from 'contexts/useUser';
import { addFavs, removeFavs, AddFavsResponse } from '../apis/getFavList';
import { useWebLogin } from 'aelf-web-login';
import { IsCAWallet } from 'utils/wallet';
import { useCallback, useMemo } from 'react';

export function useFavs() {
  const {
    walletType,
    wallet: { address },
  } = useWebLogin();

  const [, { favListChange, getFavList, setFavChangeItem }] = useUser();

  const localSave = useCallback(
    (id: string) => {
      favListChange({
        address,
        id,
      });
    },
    [favListChange, address],
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
        const data = await addFavs({ tradePairId: id, address });
        return data;
      }
    },
    [address],
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
      setFavChangeItem({ id, address, isFav: !isFav });

      if (IsCAWallet(walletType)) {
        const data = await serverSave({ favId, isFav, id });
        setFavChangeItem({ id, address, isFav: !isFav, favId: data?.id || null });
        return data;
      } else {
        localSave(id);
        return null;
      }
    },
    [address, localSave, serverSave, setFavChangeItem, walletType],
  );

  return useMemo(() => [{ favlist: getFavList(address) }, { setFavs }], [address, getFavList, setFavs]);
}
