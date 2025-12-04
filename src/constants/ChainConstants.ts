import { ContractContextState } from 'contexts/useAElfContract/types';
import { getContractKey } from 'contexts/useAElfContract/utils';
import { ChainType } from 'types';
import { ChainConstantsType, CHAIN_ID_TYPE, API_CHAINID, DEFAULT_CHAIN_INFO } from '.';

type AElfOwnConstants = {
  CONTRACTS?: { [key: string]: string };
  LOGIN_INFO?: any;
  LP_TOKEN_CONTRACT?: string;
  TOKEN_CONTRACT?: string;
  ATOKEN?: string;
};

type Constants = ChainConstantsType & AElfOwnConstants;

export class ChainConstants {
  public id: number | string;
  static constants: Constants;
  static chainId: number | string;
  static library?: undefined;
  static apiChainId?: string;
  static chainType: ChainType;
  static aelfInstance?: any;
  static aelfContracts?: ContractContextState;
  static account?: string | null;
  constructor(
    id: number | string,
    type: ChainType,
    library?: undefined,
    aelfInstance?: any,
    aelfContracts?: any,
    account?: string | null,
  ) {
    this.id = id;
    ChainConstants['library'] = library;
    ChainConstants['aelfInstance'] = aelfInstance;
    ChainConstants['chainType'] = type;
    ChainConstants['aelfContracts'] = aelfContracts;
    ChainConstants['account'] = account;
    this.setStaticAttrs();
  }
  static getContract(address: string) {
    const { aelfContracts, account, chainId } = ChainConstants;
    const key = getContractKey(address, chainId, account);
    return aelfContracts?.[key];
  }
  getStaticAttr(attrName: keyof ChainConstantsType) {
    return ChainConstants.constants[attrName];
  }
  setStaticAttrs() {
    const attrs = DEFAULT_CHAIN_INFO;
    ChainConstants['chainId'] = attrs.CHAIN_INFO.chainId;
    ChainConstants['constants'] = attrs;
    ChainConstants['apiChainId'] = API_CHAINID[attrs.CHAIN_INFO.chainId as CHAIN_ID_TYPE];
  }
}
