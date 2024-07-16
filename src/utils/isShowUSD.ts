import { WEB_LOGIN_CONFIG } from 'config/webLoginConfig';

export default function isShowUSD() {
  return WEB_LOGIN_CONFIG.baseConfig.networkType !== 'TESTNET';
}
