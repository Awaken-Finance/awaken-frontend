import { getConfig } from 'config/webLoginConfig';

export default function isShowUSD() {
  return getConfig().baseConfig.networkType !== 'TESTNET';
}
