import { request } from 'api';
import { GetUserAssetTokenResult, SetUserAssetTokenParams } from '../type';
import { message } from 'antd';

export async function getUserAssetToken(address?: string): Promise<GetUserAssetTokenResult | undefined> {
  if (!address) {
    return;
  }

  const resp: any = await request.userCenter.GET_USER_ASSET_TOKEN({
    params: {
      address,
    },
  });

  if (!resp || resp.error) {
    message.error(resp.error);
    return;
  }

  return resp.data;
}

export async function setUserAssetToken(params: SetUserAssetTokenParams): Promise<any> {
  return request.userCenter.SET_USER_ASSET_TOKEN({
    data: params,
    method: 'POST',
  });
}
