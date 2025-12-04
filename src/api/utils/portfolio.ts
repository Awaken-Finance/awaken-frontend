import { request } from 'api';
import { TAssetPortfolio, TIdleTokenInfo, TTLiquidityPositionResult } from 'types/portfolio';

export type TGetAssetPortfolioApiParams = {
  address: string;
  chainId: string;
  showCount?: number;
};

export const getAssetPortfolioApi = async ({ chainId, address, showCount = 6 }: TGetAssetPortfolioApiParams) => {
  const res: {
    code: number;
    data: TAssetPortfolio;
  } = await request.portfolio.GET_ASSET_PORTFOLIO({
    params: {
      chainId,
      showCount,
      address,
    },
  });
  return res.data;
};

export type TGetIdleTokensApiParams = {
  address: string;
  chainId: string;
  showCount?: number;
};
export const getIdleTokensApi = async ({ chainId, address, showCount = 6 }: TGetIdleTokensApiParams) => {
  const res: {
    code: number;
    data: TIdleTokenInfo;
  } = await request.portfolio.GET_IDLE_TOKENS({
    params: {
      chainId,
      showCount,
      address,
    },
  });
  return res.data;
};

export type TGetLiquidityPositionApiParams = {
  address: string;
  chainId: string;
  skipCount?: number;
  maxResultCount?: number;
};

export const getLiquidityPositionApi = async ({
  chainId,
  address,
  skipCount = 0,
  maxResultCount = 3,
}: TGetLiquidityPositionApiParams) => {
  const res: {
    code: number;
    data: TTLiquidityPositionResult;
  } = await request.portfolio.GET_LIQUIDITY_POSITION({
    params: {
      chainId,
      address,
      skipCount,
      maxResultCount,
    },
  });
  return res.data;
};
