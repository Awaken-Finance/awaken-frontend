import { SupportedChainId } from 'constants/chain';
import { supportedChainId } from 'constants/index';
import { ChainConstants } from 'constants/ChainConstants';
import { useCurrentBlockHeight } from 'hooks/useCurrentBlockHeight';
import { useActiveWeb3React } from 'hooks/web3';
import { useLanguage } from 'i18n';
import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { useEffectOnce, useSearchParam } from 'react-use';
import storages from 'storages';
import isMobile from 'utils/isMobile';
import { switchNetwork } from 'utils/network';
const body = window.document.getElementsByTagName('body')[0];
body.className = 'pc-site-content';
const INITIAL_STATE = {
  refreshTimestamp: 0,
};
const StoreContext = createContext<any>(INITIAL_STATE);

export declare type ReducerAction = {
  type: 'refreshData';
  value?: any;
};

declare type StoreState = {
  refreshTimestamp: number;
  mobile?: boolean;
  blockHeight?: number;
};
export function useStore(): [StoreState] {
  return useContext(StoreContext);
}

//reducer payload
function reducer(state: any, { type, payload }: any) {
  switch (type) {
    case 'refreshData':
      return Object.assign({}, state, {
        refreshTimestamp: Date.now(),
      });
    default:
      return Object.assign({}, state, payload);
  }
}

export default function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  // const [contracts] = useAElfContractContext();

  const { chainId, library, aelfInstance, account } = useActiveWeb3React();
  useMemo(
    () => initialized(chainId, library, aelfInstance, undefined, account),
    [chainId, library, aelfInstance, account],
  );
  const [mobile, setMobile] = useState<boolean>();
  const { language } = useLanguage();

  // isMobile
  useEffect(() => {
    const resize = () => {
      const isM = isMobile();
      setMobile(isM.apple.phone || isM.android.phone || isM.apple.tablet || isM.android.tablet);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  // className
  useEffect(() => {
    if (!body) return;
    const addClassName = [mobile ? 'mobile-site-content' : 'pc-site-content', `${language}-site-content`];
    body.className = '';
    addClassName.forEach((i) => {
      if (!body.className.includes(i)) body.className = (body.className.trim() + ' ' + i).trim();
    });
  }, [mobile, language]);

  // blockHeight
  // const blockHeight = useCurrentBlockHeight();

  // CID
  const cid = useSearchParam('cid');
  useEffectOnce(() => {
    cid && localStorage.setItem(storages.cid, cid);
  });

  const toChainId = useSearchParam('toChainId');
  useEffectOnce(() => {
    if (toChainId && supportedChainId[Number(toChainId) as SupportedChainId])
      switchNetwork(supportedChainId[Number(toChainId) as SupportedChainId].CHAIN_INFO);
  });

  return (
    <StoreContext.Provider value={useMemo(() => [{ ...state, mobile }, { dispatch }], [state, mobile])}>
      {children}
    </StoreContext.Provider>
  );
}
function initialized(
  chainId?: number | string,
  library?: undefined,
  aelfInstance?: any,
  aelfContracts?: any,
  account?: string | null,
) {
  if (chainId) {
    console.log('initialized', chainId);
    if (typeof chainId === 'string') {
      new ChainConstants(chainId, 'ELF', library, aelfInstance, aelfContracts, account);
    } else {
      new ChainConstants(chainId, 'ERC', library, aelfInstance, aelfContracts, account);
    }
  }
}
