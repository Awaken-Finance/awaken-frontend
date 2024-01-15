import { AxiosResponse } from 'axios';
import { requestConfig } from './server/myServer';

export const API_LIST = {
  GET_CHAIN_ID: '/api/app/chains',
  GET_CURRENCY_BLOCK_HEIGHT: '/api/app/chains/status', //'/api/app/chains/status',
  GET_CENTRALIZED_POOL: '/api/app/farm/farm-pool-list', //mock/list.json /api/app/farm/farm-pool-list
  GET_FARMS_SUMMARY: '/api/app/farm-statistic/pools-statistic-info', // /mock/general.json   // /farm/api/app/farm-statistic/pools-statistic-info
  // GET_DIVIDEND_SUMMARY: '/mock/dividend.json', // /api/app/dividend-pools
  GET_DIVIDEND_POOLS: '/api/app/dividend/dividend-pools', //'/mock/dividend.json', //
  GET_DIVIDEND_PROFITS: '/api/app/dividend/dividend', // '/mock/dividendProfits.json',
  GET_DIVIDEND_STATISTIC: '/api/app/dividend/dividend-pool-statistic',
  GET_TRADE_PAIRS_LIST: '/api/app/trade-pairs',
  GET_TRADE_RECORDS: '/api/app/trade-records',
  GET_IDO_INFO: '/mock/ido.json',
  GET_TOKEN_PRICE: '/mock/price.json',
  GET_EXCHANGE_TRADE_PAIR_BY_SEARCH: '/api/app/trade-pairs/by-ids',
  GET_IDO_INFORMATION: '/api/app/ido/public-offerings',
  GET_TRANSACTION_FEE: '/api/app/transaction-fee',
  SET_FAVS: '/api/app/favs',
};

const LENDING_API_LIST = {
  GET_C_TOKEN_LIST: '/api/app/debit/c-token-list',
  GET_COMP_CONTROLLER_LIST: '/api/app/debit/comp-controller-list',
};

const TOKEN_API_LIST = {
  GET_TOKEN_PRICE: '/api/app/token/price',
  GET_FARM_TOKEN_PRICE: '/api/app/farm/prices',
};

const CMS_API_LIST = {
  GET_PINNED_TOKENS: '/cms/items/pinned_tokens',
  GET_POOLS_TOP: '/cms/recommons', // '/api/app/trade-pairs/top',
};

export const USER_CENTER_API_LIST = {
  GET_USER_ASSET_TOKEN_LIST: '/api/app/asset/token-list',
  GET_USER_ASSET_EXCHANGE: '/api/app/liquidity/user-asset', //'/mock/assetExchange.json',
  GET_USER_ASSET_DIVIDEND: '/api/app/dividend/user-dividend', // /api/app/dividend/revenue
  GET_USER_DIVIDEND_STATISTIC: '/api/app/dividend/user-statistic',
  GET_USER_ASSET_FARM: '/api/app/farm-statistic/users-statistic-info', //   // /farms/api/app/farm-statistic/users-statistic-info
  GET_USER_ASSET_FARM_LIST: '/api/app/farm/farm-user-info-list', // /mock/assetFarmList.json  //farms/api/app/farm/farm-user-info-list
  GET_RECENT_TRANSACTION_LIST: '/api/app/trade-records',
  GET_USER_LIQUIDITYl: '/api/app/liquidity/user-liquidity',
  GET_USER_LIQUIDITY_RECORDS: '/api/app/liquidity/liquidity-records',
  GET_USER_ASSET_TOKEN: '/api/app/user-assets-token',
  SET_USER_ASSET_TOKEN: '/api/app/user-assets-token',
};

export const EXPAND_APIS = {
  cms: CMS_API_LIST,
  token: TOKEN_API_LIST,
  lending: LENDING_API_LIST,
  userCenter: USER_CENTER_API_LIST,
};

export type API_REQ_FUNCTION = (config?: requestConfig) => Promise<any | AxiosResponse<any>>;

export type API_REQ_TYPES = {
  [x in keyof typeof API_LIST]: API_REQ_FUNCTION;
};

export type EXPAND_REQ_TYPES = {
  [X in keyof typeof EXPAND_APIS]: {
    [K in keyof typeof EXPAND_APIS[X]]: API_REQ_FUNCTION;
  };
};
