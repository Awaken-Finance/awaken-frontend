import { Method } from 'axios';
import { PROD_API, PROD_CMS } from 'constants/api';
import server from 'utils/request';
import { API_LIST, API_REQ_TYPES, EXPAND_APIS, EXPAND_REQ_TYPES } from './list';
import myServer from './server/myServer';
const { REACT_APP_API_ENV } = process.env;
export interface IBaseRequest {
  url: string;
  method?: Method;
  params?: any;
  data?: any;
  errMessage?: string;
  query?: string; //this for url parameter； example: test/:id
}

function baseRequest({
  url,
  method = 'GET',
  params = '',
  errMessage = 'baseRequest-err',
  data,
  query = '',
}: IBaseRequest) {
  return server({
    url: spliceUrl(url, query),
    method,
    data,
    params,
  }).catch((error) => {
    console.error(error, errMessage);
    return { error: errMessage };
  });
}

myServer.parseRouter('api', API_LIST);

Object.entries(EXPAND_APIS).forEach(([key, value]) => {
  myServer.parseRouter(key, value);
});

const request: API_REQ_TYPES & EXPAND_REQ_TYPES = Object.assign({}, myServer.api, myServer);

export { API_LIST, baseRequest, request };

export function spliceUrl(baseUrl: string, extendArg?: string) {
  let base = '';
  if (REACT_APP_API_ENV) {
    if (baseUrl.startsWith('/api/')) base = PROD_API[REACT_APP_API_ENV] || PROD_API['mainnet'];
    if (baseUrl.startsWith('/items/')) base = PROD_CMS[REACT_APP_API_ENV] || PROD_CMS['mainnet'];
  }
  return base + (extendArg ? baseUrl + '/' + extendArg : baseUrl);
}
