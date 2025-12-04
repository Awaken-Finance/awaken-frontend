import { request } from 'api';
import { PinnedToken } from 'types';

export type PinnedTokensMap = { [x: string]: PinnedToken };

export async function pinnedTokens(chainId: any): Promise<PinnedToken[]> {
  const data: any = await request.cms.GET_PINNED_TOKENS({
    errMessage: 'GET_PINNED_TOKENS',
    params: {
      filter: {
        chainId: {
          _eq: chainId,
        },
      },
    },
  });

  if (!data || !data.data) {
    return [];
  }

  return data.data;
}
