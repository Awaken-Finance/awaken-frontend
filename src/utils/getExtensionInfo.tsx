import { APP_NAME } from 'constants/aelf';
import { ChainConstants } from 'constants/ChainConstants';
import { NightElf } from 'utils/NightElf';

const getExtensionInfo = async () => {
  try {
    const aelf = NightElf.initAelfInstanceByExtension(ChainConstants.constants.CHAIN_INFO.rpcUrl, APP_NAME);
    // eslint-disable-next-line no-unsafe-optional-chaining
    const { locked } = await aelf?.getExtensionInfo?.();
    return locked;
  } catch (e) {
    console.warn(e);
    return true;
  }
};
export default getExtensionInfo;
