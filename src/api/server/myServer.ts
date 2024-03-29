import { spliceUrl } from 'api';
import { Method } from 'axios';
import server from 'utils/request';

export type requestConfig = {
  method?: Method;
  params?: any;
  data?: any;
  errMessage?: string;
  query?: string;
};

const myServer = new Function();

/**
 * @method parseRouter
 * @param  {string} name
 * @param  {object} urlObj
 */
myServer.prototype.parseRouter = function (name: string, urlObj: any) {
  const obj: any = (this[name] = {});
  Object.keys(urlObj).forEach((item) => {
    obj[item] = this.send.bind(this, urlObj[item]);
  });
};

/**
 * @method send
 * @param  {string} url
 * @param  {object} config
 * @return {Promise<any>}
 */
myServer.prototype.send = function (url: string, config: requestConfig) {
  const { method = 'GET', query = '', data = '', params = '', errMessage } = config || {};
  return server({
    url: spliceUrl(url, query),
    method,
    params,
    data,
  }).catch((error) => console.error(error, errMessage));
};

export default myServer.prototype;
