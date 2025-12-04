import { basicActions } from 'contexts/utils';

const tokenPricesActions = {
  setTokenPrice: 'SET_TOKEN_PRICE',
};

export type State = {
  tokenPrices: {
    [chainId: string]: {
      [key: string]: string;
    };
    [chainId: number]: {
      [key: string]: string;
    };
  };
};

export const basicTokenPricesView = {
  setTokenPrice: {
    type: tokenPricesActions['setTokenPrice'],
    actions: (obj: { [key: string]: string }) => basicActions(tokenPricesActions['setTokenPrice'], obj),
  },
};
