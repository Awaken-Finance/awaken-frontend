import { request } from 'api';
import { DEFAULT_CHAIN } from 'constants/index';
import { StatusCodeEnum, TPairRoute, TSwapRecordItem, TSwapRoute, TSwapRouteInfo } from '../types';
import { TEN_THOUSAND, ZERO } from 'constants/misc';
import { divDecimals } from 'utils/calculate';
import { getAmountByInput, getAmountOut } from 'utils/swap';
import { IContract } from 'types';
import BigNumber from 'bignumber.js';
import { TCommonAPIResult } from 'types/common';

export const getPairPathApi = async ({
  startSymbol,
  endSymbol,
}: {
  startSymbol: string;
  endSymbol: string;
}): Promise<any> => {
  const res: {
    code: number;
    data: {
      totalCount: number;
      items: any;
    };
  } = await request.GET_PAIR_PATH({
    params: {
      ChainId: DEFAULT_CHAIN,
      StartSymbol: startSymbol,
      EndSymbol: endSymbol,
    },
  });
  if (!res) throw new Error('no pair path');
  return res?.data?.items || [];
};

export type TGetSwapRoutesParams = {
  symbolIn: string;
  symbolOut: string;
  isFocusValueIn: boolean;
  amountIn?: string;
  amountOut?: string;
};
export type TGetSwapRoutesResult = TCommonAPIResult<{
  routes: TSwapRoute[];
  statusCode: StatusCodeEnum;
}>;
export const getSwapRoutes = async ({
  symbolIn,
  symbolOut,
  isFocusValueIn,
  amountIn,
  amountOut,
}: TGetSwapRoutesParams) => {
  const res: TGetSwapRoutesResult = await request.GET_SWAP_ROUTES({
    params: {
      ChainId: DEFAULT_CHAIN,
      symbolIn,
      symbolOut,
      routeType: isFocusValueIn ? 0 : 1,
      amountIn,
      amountOut,
    },
  });
  if (!res) throw new Error('no swap route');
  return res?.data;
};

export const getRouteInfoWithValueIn = (routeList: TPairRoute[], valueIn: string): TSwapRouteInfo[] => {
  const result = routeList.map((route) => {
    const rate = `${route.feeRate * 100}`;

    let _input = ZERO.plus(valueIn);
    const length = route.rawPath.length - 1;
    const recordList: TSwapRecordItem[] = [];
    for (let i = 0; i < length; i++) {
      const _token0 = route.rawPath[i];
      const _token1 = route.rawPath[i + 1];

      const path = route.path[i];
      let _token0Amount = ZERO;
      let _token1Amount = ZERO;
      if (_token0.symbol === path.token0.symbol) {
        _token0Amount = divDecimals(path.token0Amount || '0', path.token0.decimals);
        _token1Amount = divDecimals(path.token1Amount || '0', path.token1.decimals);
      } else {
        _token0Amount = divDecimals(path.token1Amount || '0', path.token1.decimals);
        _token1Amount = divDecimals(path.token0Amount || '0', path.token0.decimals);
      }

      const totalValueOriginBN = getAmountOut(rate, _input, _token0Amount, _token1Amount);
      const totalValue = totalValueOriginBN.dp(_token1.decimals, BigNumber.ROUND_DOWN);

      recordList.push({
        tokenIn: _token0,
        tokenOut: _token1,
        valueIn: _input.toFixed(),
        valueOut: totalValue.toFixed(),
        tokenInReserve: _token0Amount.toFixed(),
        tokenOutReserve: _token1Amount.toFixed(),
      });
      if (totalValue.eq(ZERO)) {
        return null;
      }

      _input = totalValue;
    }
    return {
      valueIn,
      route: route,
      valueOut: _input.toFixed(),
      recordList,
    };
  });

  console.log('result', result);
  return result.filter((item) => item !== null) as TSwapRouteInfo[];
};

export const getRouteInfoWithValueOut = (routeList: TPairRoute[], valueOut: string): TSwapRouteInfo[] => {
  const result = routeList.map((route) => {
    const rate = `${route.feeRate * 100}`;

    let _input = ZERO.plus(valueOut);
    const recordList: TSwapRecordItem[] = [];
    for (let i = route.rawPath.length - 1; i >= 1; i--) {
      const _token0 = route.rawPath[i];
      const _token1 = route.rawPath[i - 1];

      const path = route.path[i - 1];
      let _token0Amount = ZERO;
      let _token1Amount = ZERO;
      if (_token0.symbol === path.token0.symbol) {
        _token0Amount = divDecimals(path.token0Amount || '0', path.token0.decimals);
        _token1Amount = divDecimals(path.token1Amount || '0', path.token1.decimals);
      } else {
        _token0Amount = divDecimals(path.token1Amount || '0', path.token1.decimals);
        _token1Amount = divDecimals(path.token0Amount || '0', path.token0.decimals);
      }

      if (_input.gte(_token0Amount)) {
        return null;
      }

      const totalValueOriginBN = getAmountByInput(rate, _input, _token0Amount, _token1Amount);
      const totalValue = totalValueOriginBN.dp(_token1.decimals, BigNumber.ROUND_UP);

      recordList.push({
        tokenIn: _token1,
        tokenOut: _token0,
        valueIn: totalValue.toFixed(),
        valueOut: _input.toFixed(),
        tokenInReserve: _token1Amount.toFixed(),
        tokenOutReserve: _token0Amount.toFixed(),
      });

      // console.log('totalValue', totalValue.toFixed());
      _input = totalValue;
    }
    recordList.reverse();
    return {
      valueIn: _input.toFixed(),
      route: route,
      valueOut,
      recordList,
    };
  });

  console.log('result', result);
  return result.filter((item) => item !== null) as TSwapRouteInfo[];
};

export type TGetContractAmountOutParams = {
  contract: IContract;
  amountIn: string;
  path: string[];
  feeRates: Array<string | number>;
};
export const getContractAmountOut = async ({
  contract,
  amountIn,
  path,
  feeRates,
}: TGetContractAmountOutParams): Promise<{ amount: string[] }> => {
  return await contract.callViewMethod('GetAmountsOut', {
    amountIn,
    path,
    feeRates,
  });
};

export type TGetContractTotalAmountOutParams = {
  contract: IContract;
  swapRoute: TSwapRoute;
};
export const getContractTotalAmountOut = async ({ contract, swapRoute }: TGetContractTotalAmountOutParams) => {
  const result = await Promise.all(
    swapRoute.distributions.map((item) => {
      return getContractAmountOut({
        contract,
        amountIn: item.amountIn,
        path: item.tokens.map((token) => token.symbol),
        feeRates: item.feeRates.map((fee) => ZERO.plus(TEN_THOUSAND).times(fee).toNumber()),
      });
    }),
  );
  const amountOuts = result.map((item) => item?.amount[item?.amount?.length - 1]);

  return {
    amountOuts,
    total: amountOuts.reduce((p, c) => p.plus(c), ZERO).toFixed(),
  };
};
