import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { NightElf } from 'utils/NightElf';
import { message } from 'antd';
import { ChainConstants } from 'constants/ChainConstants';
import { APP_NAME } from 'constants/aelf';
import { useEffectOnce } from 'react-use';
import { getAElf } from 'utils/aelfUtils';
import { ChainStatus } from 'types/aelf';
import { sleep } from 'utils';
import getExtensionInfo from 'utils/getExtensionInfo';
import getExtension from 'utils/getExtension';
import i18n from 'i18n';
const INITIAL_STATE = {
  installedNightElf: !!window?.NightElf,
};
const AElfContext = createContext<any>(INITIAL_STATE);

type State = {
  installedNightElf: boolean;
  address?: string;
  name?: string;
  publicKey?: {
    x: string;
    y: string;
  };
  appPermission?: any;
  aelfInstance?: any;
  chainId?: string;
  chainStatus?: ChainStatus;
};
const LOGIN = 'LOGIN';
const LOGOUT = 'LOGOUT';
const SET_AELF = 'SET_AELF';

type Actions = {
  connect: (manual?: boolean) => Promise<boolean>;
  disConnect: () => void;
  checkLogin: () => Promise<undefined | boolean>;
  setChainStatus: (chainStatus: ChainStatus) => void;
};

export function useAElf(): [State, Actions] {
  return useContext(AElfContext);
}

//reducer
function reducer(state: any, { type, payload }: any) {
  switch (type) {
    case LOGOUT: {
      return Object.assign({}, state, {
        address: null,
        name: null,
        publicKey: null,
        appPermission: null,
        aelfInstance: null,
        chainId: null,
      });
    }
    default: {
      return Object.assign({}, state, payload);
    }
  }
}

export default function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch]: [State, any] = useReducer(reducer, INITIAL_STATE);

  const connect = useCallback(async (manual = false) => {
    const aelfInstance = getAElf();
    console.log(aelfInstance, '====aelfInstance');
    return new Promise((resolve, reject) => {
      NightElf.getInstance()
        .check.then(async () => {
          const aelf = NightElf.initAelfInstanceByExtension(ChainConstants.constants.CHAIN_INFO.rpcUrl, APP_NAME);
          const locked = await getExtensionInfo();
          if (!locked || manual) {
            aelf
              .login(ChainConstants.constants.LOGIN_INFO)
              .then(async (result: { error: any; errorMessage: { message: any }; detail: string }) => {
                if (result.error) {
                  message.warning(result.errorMessage.message || result.errorMessage);
                  reject(false);
                } else {
                  try {
                    await aelf.chain.getChainStatus();
                  } catch (e) {
                    console.error('getChainStatus error', e);
                  }
                  const detail = JSON.parse(result.detail);
                  dispatch({
                    type: LOGIN,
                    payload: { ...detail, aelfInstance: aelf },
                  });
                  resolve(true);
                }
              })
              .catch((error: { message: any }) => {
                dispatch({
                  type: SET_AELF,
                  payload: { aelfInstance },
                });
                reject(false);
                message.error(error.message || i18n.t('Failed to log in using NightELF. Please try it again'));
              });
          } else {
            dispatch({
              type: SET_AELF,
              payload: { aelfInstance },
            });
          }
        })
        .catch((error: { message: any }) => {
          dispatch({
            type: SET_AELF,
            payload: { aelfInstance },
          });
          reject(false);
          manual && getExtension();
          console.log('error: ', error);
        });
    });
  }, []);
  const disConnect = useCallback(async () => {
    if (!state.address || !state.aelfInstance) {
      message.error('Please login');
      return;
    }
    state.aelfInstance.logout(
      {
        address: state.address,
      },
      (error: { errorMessage: { message: any }; message: any }) => {
        if (error) {
          message.error(error.errorMessage.message || error.errorMessage || error.message);
        } else {
          const aelfInstance = getAElf();
          dispatch({
            type: LOGOUT,
          });
          dispatch({
            type: SET_AELF,
            payload: { aelfInstance },
          });
        }
      },
    );
  }, [state.address, state.aelfInstance]);

  const checkLogin = useCallback(async () => {
    const { aelfInstance, address } = state || {};
    if (!address || !aelfInstance) return false;
    const login = await aelfInstance.login(ChainConstants.constants.LOGIN_INFO);
    if (login?.error) {
      message.error(login.errorMessage.message || login.errorMessage || login.message);
      dispatch({
        type: LOGOUT,
      });
      return false;
    } else {
      const detail = JSON.parse(login.detail);
      dispatch({
        type: LOGIN,
        payload: { ...detail, aelfInstance: aelfInstance },
      });
      return true;
    }
  }, [state]);
  const setChainStatus = useCallback((chainStatus: ChainStatus) => {
    dispatch({
      type: SET_AELF,
      payload: { chainStatus },
    });
  }, []);

  useEffectOnce(() => {
    const aelfInstance = getAElf();
    if (ChainConstants.chainType === 'ELF') {
      Promise.race([connect(), sleep(5000)]).then((v) => {
        if (v === 'sleep') {
          dispatch({
            type: SET_AELF,
            payload: { aelfInstance },
          });
        }
      });
    }
  });
  return (
    <AElfContext.Provider
      value={useMemo(
        () => [
          { ...state, aelfInstance: state.aelfInstance || getAElf() },
          {
            connect,
            disConnect,
            checkLogin,
            setChainStatus,
          },
        ],
        [state, connect, disConnect, checkLogin, setChainStatus],
      )}>
      {children}
    </AElfContext.Provider>
  );
}
