import { AxiosResponse } from 'axios';
import { requestConfig } from './server/myServer';

export const API_LIST = {
  GET_CHAIN_ID: 'https://test.awaken.finance/api/app/chains',
  GET_CURRENCY_BLOCK_HEIGHT: 'https://test.awaken.finance/api/app/chains/status', //'https://test.awaken.finance/api/app/chains/status',
  GET_CENTRALIZED_POOL: 'https://test.awaken.finance/api/app/farm/farm-pool-list', //mock/list.json https://test.awaken.finance/api/app/farm/farm-pool-list
  GET_FARMS_SUMMARY: 'https://test.awaken.finance/api/app/farm-statistic/pools-statistic-info', // /mock/general.json   // /farmhttps://test.awaken.finance/api/app/farm-statistic/pools-statistic-info
  // GET_DIVIDEND_SUMMARY: '/mock/dividend.json', // https://test.awaken.finance/api/app/dividend-pools
  GET_DIVIDEND_POOLS: 'https://test.awaken.finance/api/app/dividend/dividend-pools', //'/mock/dividend.json', //
  GET_DIVIDEND_PROFITS: 'https://test.awaken.finance/api/app/dividend/dividend', // '/mock/dividendProfits.json',
  GET_DIVIDEND_STATISTIC: 'https://test.awaken.finance/api/app/dividend/dividend-pool-statistic',
  GET_TRADE_PAIRS_LIST: 'https://test.awaken.finance/api/app/trade-pairs',
  GET_TRADE_RECORDS: 'https://test.awaken.finance/api/app/trade-records',
  GET_IDO_INFO: '/mock/ido.json',
  GET_TOKEN_PRICE: '/mock/price.json',
  GET_EXCHANGE_TRADE_PAIR_BY_SEARCH: 'https://test.awaken.finance/api/app/trade-pairs/by-ids',
  GET_IDO_INFORMATION: 'https://test.awaken.finance/api/app/ido/public-offerings',
  GET_TRANSACTION_FEE: 'https://test.awaken.finance/api/app/transaction-fee',
  SET_FAVS: 'https://test.awaken.finance/api/app/favs',
  GET_PAIR_PATH: 'https://test.awaken.finance/api/app/token-paths',
};

const LENDING_API_LIST = {
  GET_C_TOKEN_LIST: 'https://test.awaken.finance/api/app/debit/c-token-list',
  GET_COMP_CONTROLLER_LIST: 'https://test.awaken.finance/api/app/debit/comp-controller-list',
};

const TOKEN_API_LIST = {
  GET_TOKEN_PRICE: 'https://test.awaken.finance/api/app/token/price',
  GET_FARM_TOKEN_PRICE: 'https://test.awaken.finance/api/app/farm/prices',
};

const CMS_API_LIST = {
  GET_PINNED_TOKENS: '/cms/items/pinned_tokens',
  GET_POOLS_TOP: '/cms/recommons', // 'https://test.awaken.finance/api/app/trade-pairs/top',
};

export const USER_CENTER_API_LIST = {
  GET_USER_ASSET_TOKEN_LIST: 'https://test.awaken.finance/api/app/asset/token-list',
  GET_USER_ASSET_EXCHANGE: 'https://test.awaken.finance/api/app/liquidity/user-asset', //'/mock/assetExchange.json',
  GET_USER_ASSET_DIVIDEND: 'https://test.awaken.finance/api/app/dividend/user-dividend', // https://test.awaken.finance/api/app/dividend/revenue
  GET_USER_DIVIDEND_STATISTIC: 'https://test.awaken.finance/api/app/dividend/user-statistic',
  GET_USER_ASSET_FARM: 'https://test.awaken.finance/api/app/farm-statistic/users-statistic-info', //   // /farmshttps://test.awaken.finance/api/app/farm-statistic/users-statistic-info
  GET_USER_ASSET_FARM_LIST: 'https://test.awaken.finance/api/app/farm/farm-user-info-list', // /mock/assetFarmList.json  //farmshttps://test.awaken.finance/api/app/farm/farm-user-info-list
  GET_RECENT_TRANSACTION_LIST: 'https://test.awaken.finance/api/app/trade-records',
  GET_USER_LIQUIDITYl: 'https://test.awaken.finance/api/app/liquidity/user-liquidity',
  GET_USER_LIQUIDITY_RECORDS: 'https://test.awaken.finance/api/app/liquidity/liquidity-records',
  GET_USER_ASSET_TOKEN: 'https://test.awaken.finance/api/app/user-assets-token',
  SET_USER_ASSET_TOKEN: 'https://test.awaken.finance/api/app/user-assets-token',
  GET_USER_COMBINED_ASSETS: 'https://test.awaken.finance/api/app/asset/user-combined-assets',
};

export const PORTFOLIO_API_LIST = {
  GET_ASSET_PORTFOLIO: 'https://test.awaken.finance/api/app/asset/user-portfolio',
  GET_IDLE_TOKENS: 'https://test.awaken.finance/api/app/asset/idle-tokens',
  GET_LIQUIDITY_POSITION: 'https://test.awaken.finance/api/app/liquidity/user-positions',
};

export const EXPAND_APIS = {
  cms: CMS_API_LIST,
  token: TOKEN_API_LIST,
  lending: LENDING_API_LIST,
  userCenter: USER_CENTER_API_LIST,
  portfolio: PORTFOLIO_API_LIST,
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
