import { CHAIN_NAME, DEFAULT_CHAIN } from '../constants';

export default function useChainId() {
  return {
    chainId: DEFAULT_CHAIN,
    chainName: CHAIN_NAME[DEFAULT_CHAIN],
    apiChainId: DEFAULT_CHAIN,
  };
}
