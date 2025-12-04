import { TokenInfo } from 'types';
import { GenerateType, PartialOption } from './common';

export type TTradePair = {
  chainId: string;
  address: string;
  feeRate: number;
  isTokenReversed: boolean;
  token0: TokenInfo;
  token1: TokenInfo;
  id: string;
};

export type TTradePairInfo = GenerateType<
  PartialOption<TTradePair, 'id'> & {
    price: string;
    volume24h: string;
    tvl: string;
    volume24hInUsd: string;
  }
>;
