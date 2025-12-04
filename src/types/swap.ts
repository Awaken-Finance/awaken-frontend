import { Currency } from '@awaken/sdk-core';
import BigNumber from 'bignumber.js';

export type Pairs = { [key in string]: string };

export type Reserves = {
  [key: string]: string;
};
export type Tokens = {
  [key: string]: Currency;
};
export type Inputs = {
  [key: string]: string | undefined;
};
export type Outputs = {
  [key: string]: string;
};

export type RemoveOutputs = {
  [key: string]: string | undefined;
};

export type CurrencyBalances = {
  [key: string]: BigNumber;
};
