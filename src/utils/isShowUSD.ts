import { getConfig } from 'aelf-web-login';

export default function isShowUSD() {
  return getConfig().networkType !== 'TESTNET';
}
