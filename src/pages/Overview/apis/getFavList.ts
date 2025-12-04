import { request, baseRequest, API_LIST } from 'api';
import { Response } from 'types/response';

export interface AddFavsResponse {
  id: string;
  address: string;
  tradePairId: string;
}

export async function addFavs(params: { tradePairId?: string; address?: string }): Promise<AddFavsResponse | null> {
  const response: Response<AddFavsResponse | null> = await request.SET_FAVS({
    method: 'POST',
    data: params,
  });

  return response?.data;
}

export async function removeFavs(params: { id?: string | null }): Promise<null> {
  await baseRequest({
    url: `${API_LIST.SET_FAVS}/${params.id}`,
    method: 'DELETE',
  });

  return null;
}
