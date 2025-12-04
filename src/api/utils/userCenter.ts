import { request } from 'api';
import { TUserCombinedAssets } from 'types/userCenter';

export type TGetUserCombinedAssetsApiParams = {
  address: string;
  chainId: string;
};

export const getUserCombinedAssetsApi = async ({ chainId, address }: TGetUserCombinedAssetsApiParams) => {
  const res: {
    code: number;
    data: TUserCombinedAssets;
  } = await request.userCenter.GET_USER_COMBINED_ASSETS({
    params: {
      chainId,
      address,
    },
  });
  return res.data;
};
