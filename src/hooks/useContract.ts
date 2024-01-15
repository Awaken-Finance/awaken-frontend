import {
  ERC20_ABI,
  FARMS_CENTRALIZED_ABI,
  FARMS_ABI,
  DIVIDEND_ABI,
  LOCK_EXCHANGE_ABI,
  LP_TOKEN_ABI,
  ERC20_BYTES32_ABI,
  ENS_PUBLIC_RESOLVER_ABI,
  IDO_ABI,
} from 'constants/abis';
import { ChainConstants } from 'constants/ChainConstants';
import { SupportedSwapRate } from 'constants/swap';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AElfContract, IContract } from 'types';
import { getContractMethods, isELFChain, transformArrayToMap } from 'utils/aelfUtils';
import { ContractBasic, ContractInterface } from 'utils/contract';
import { useActiveWeb3React } from './web3';
import { useCallContract } from 'aelf-web-login';

function formatMethodName(methodName: string) {
  const newMethodName = methodName[0].toUpperCase() + methodName.slice(1);
  return newMethodName;
}

export function getContract(address: string, ABI: any, library?: undefined, contract?: AElfContract) {
  return new ContractBasic({
    contractAddress: address,
    contractABI: ABI,
    provider: library,
    ...contract,
  });
}

export function useGetContractMethods(contractAddress?: string) {
  const addressRef = useRef<string>();
  const methodsRef = useRef<any>();
  const promisesRef = useRef<any[]>([]);

  const fetchContractMethods = useCallback(async () => {
    if (!contractAddress) return;
    try {
      // console.log('[Contract] getContractMethods', contractAddress);
      const methods = await getContractMethods(contractAddress);
      // console.log('[Contract] getContractMethods', methods);
      methodsRef.current = methods;
      addressRef.current = contractAddress;
      promisesRef.current.forEach(({ resolve }) => {
        try {
          resolve(methods);
        } catch (error: any) {
          console.error(error);
        }
      });
    } catch (error: any) {
      addressRef.current = undefined;
      console.error(error);
      promisesRef.current.forEach(({ reject }) => {
        reject(error);
      });
    } finally {
      promisesRef.current = [];
    }
  }, [contractAddress]);

  useEffect(() => {
    if (!contractAddress) return;
    fetchContractMethods();
  }, [contractAddress, fetchContractMethods]);

  return useCallback(async () => {
    if (!contractAddress) {
      return Promise.reject('Contract address is empty');
    }
    if (contractAddress === addressRef.current) {
      return Promise.resolve(methodsRef.current);
    }
    return new Promise<any>((resolve, reject) => {
      promisesRef.current.push({ resolve, reject });
    });
  }, [contractAddress]);
}

export function useAElfContract(contractAddress?: string) {
  const { callViewMethod, callSendMethod } = useCallContract();

  const getContractMethods = useGetContractMethods(contractAddress);

  return useMemo(() => {
    if (!contractAddress) {
      return;
    }

    const contract: ContractInterface = {
      address: contractAddress,
      contractType: 'ELF',
      callViewMethod: async (functionName: string, paramsOption: any, callOptions = { defaultBlock: 'latest' }) => {
        if (!contractAddress) {
          throw new Error(`Invalid contract address: ${contractAddress}`);
        }

        const methodName = formatMethodName(functionName);
        const methods = await getContractMethods();
        const inputType = methods[methodName];
        const args = transformArrayToMap(inputType, paramsOption);
        // console.log('[Contract] callViewMethod', contractAddress, methodName, paramsOption, args);
        const result = callViewMethod({
          contractAddress,
          methodName,
          args: args,
        });
        return result;
      },
      callSendMethod: async (functionName: string, account: string, paramsOption: any, sendOptions: any) => {
        if (!contractAddress) {
          throw new Error(`Invalid contract address: ${contractAddress}`);
        }
        const methodName = formatMethodName(functionName);
        const methods = await getContractMethods();
        const inputType = methods[methodName];
        const args = transformArrayToMap(inputType, paramsOption);
        // console.log('[Contract] callSendMethod', contractAddress, methodName, paramsOption, args);
        return callSendMethod(
          {
            contractAddress,
            methodName,
            args: args,
          },
          sendOptions,
        );
      },
      callSendPromiseMethod: async (functionName: string, account: string, paramsOption: any, sendOptions: any) => {
        if (!contractAddress) {
          throw new Error(`Invalid contract address: ${contractAddress}`);
        }
        const methodName = formatMethodName(functionName);
        const methods = await getContractMethods();
        const inputType = methods[methodName];
        const args = transformArrayToMap(inputType, paramsOption);
        // console.log('[Contract] callSendMethod', contractAddress, methodName, paramsOption, args);
        return callSendMethod(
          {
            contractAddress,
            methodName,
            args: args,
          },
          sendOptions,
        );
      },
    };
    return contract;
  }, [callSendMethod, callViewMethod, contractAddress, getContractMethods]);
}
export function useERCContract(address: string | undefined, ABI: any) {
  const { library, chainId } = useActiveWeb3React();
  return useMemo(() => {
    if (!address || isELFChain(chainId)) return undefined;
    try {
      return getContract(address, ABI, library);
    } catch (error) {
      console.log(error, '====useERCContract');
      return undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ABI, address, library]);
}
function useContract(address: string | undefined, ABI?: any) {
  const elfContract = useAElfContract(address);
  return elfContract;
}

export function useTokenContract(address?: string) {
  const { chainId } = useActiveWeb3React();
  let tokenAddress = address;
  if (typeof chainId === 'string') {
    tokenAddress = ChainConstants.constants?.TOKEN_CONTRACT;
  }
  return useContract(tokenAddress, ERC20_ABI);
}

export function useTokensContract(addresses: string[]) {
  const [tokensContract, setTokensContract] = useState<ContractBasic[] | null>(null);
  const { library } = useActiveWeb3React();
  const result = useCreateMultiContract(addresses, ERC20_ABI, library);
  useEffect(() => {
    setTokensContract(result);
  }, [result]);
  return tokensContract;
}

export function useRouterContract(rate?: string) {
  return useAElfContract(rate ? ChainConstants.constants.ROUTER[rate] : undefined);
}

export function useLpContract(lpAddress?: string) {
  return useContract(lpAddress, LP_TOKEN_ABI);
}
export function useFarmCentralizedContract() {
  // 0x4Fd2ce159017f60fa57963fc5B7De2E70DEcE5dA
  return useContract(ChainConstants.constants.FARM_PHASE1_ADDRESS, FARMS_CENTRALIZED_ABI);
}
export function useFarmContract() {
  // 0x4Fd2ce159017f60fa57963fc5B7De2E70DEcE5dA
  return useContract(ChainConstants.constants.FARM_PHASE2_ADDRESS, FARMS_ABI);
}

function useCreateMultiContract(addresses: string[], ABI: any, library?: any): ContractBasic[] | null {
  const [multiContract, setMultiContract] = useState<Array<IContract> | null>(null);
  const aelfLpTokenContract = useFactoryContract(SupportedSwapRate.percent_0_3);
  const tokenContract = useTokenContract();
  const chainId = ChainConstants.chainId;

  useEffect(() => {
    if (typeof chainId === 'string') {
      aelfLpTokenContract && setMultiContract(addresses.map(() => aelfLpTokenContract));
      // tokenContract && setMultiContract(addresses.map(() => tokenContract));
      return;
    }
  }, [addresses, aelfLpTokenContract, chainId, tokenContract]);

  useEffect(() => {
    if (typeof chainId === 'string') return;
    if (!library || !addresses.length) {
      return setMultiContract(null);
    }

    setMultiContract(addresses.map((addr) => getContract(addr, ABI, library)));
  }, [ABI, addresses, chainId, library]);
  return multiContract;
}

export function useFarmTokensContract(addr: string[] | string) {
  const [farmListsContract, setFarmListsContract] = useState<ContractBasic[] | null>([]);
  const [address, setAddress] = useState<string[]>([]);
  const { library } = useActiveWeb3React();

  useEffect(() => {
    if (addr) {
      setAddress(Array.isArray(addr) ? addr : addr.split('_'));
    }
  }, [addr]);
  const result = useCreateMultiContract(address, LP_TOKEN_ABI, library);

  useEffect(() => {
    setFarmListsContract(result);
  }, [result]);
  return farmListsContract;
}

export function useLockExchangeContract() {
  return useContract(ChainConstants.constants.LOCK_EXCHANGE_ADDRESS, LOCK_EXCHANGE_ABI);
}

export function useDividendContract() {
  return useContract(ChainConstants.constants.DIVIDEND_CONTRACT_ADDRESS, DIVIDEND_ABI);
}

export function useBytes32TokenContract(tokenAddress?: string) {
  return useContract(tokenAddress, ERC20_BYTES32_ABI);
}
export function useENSRegistrarContract() {
  return useContract(ChainConstants.constants.ENS_REGISTRAR_ADDRESSES, ERC20_BYTES32_ABI);
}

export function useIDOContract() {
  return useContract(ChainConstants.constants.IDO_ADDRESS, IDO_ABI);
}

export function useENSResolverContract(address: string | undefined) {
  return useContract(address, ENS_PUBLIC_RESOLVER_ABI);
}

export function useFactoryContracts() {
  const contract_0_3 = useAElfContract(ChainConstants.constants.FACTORY[SupportedSwapRate.percent_0_3]);
  const contract_0_05 = useAElfContract(ChainConstants.constants.FACTORY[SupportedSwapRate.percent_0_05]);
  const contract_1 = useAElfContract(ChainConstants.constants.FACTORY[SupportedSwapRate.percent_1]);
  const contract_3 = useAElfContract(ChainConstants.constants.FACTORY[SupportedSwapRate.percent_3]);
  const contract_5 = useAElfContract(ChainConstants.constants.FACTORY[SupportedSwapRate.percent_5]);
  const factoryContracts = useMemo(
    () => ({
      [SupportedSwapRate.percent_0_3]: contract_0_3,
      [SupportedSwapRate.percent_0_05]: contract_0_05,
      [SupportedSwapRate.percent_1]: contract_1,
      [SupportedSwapRate.percent_3]: contract_3,
      [SupportedSwapRate.percent_5]: contract_5,
    }),
    [contract_0_3, contract_0_05, contract_1, contract_3, contract_5],
  );
  return factoryContracts;
}
export function useSwapContract(rate?: string) {
  return useContract(ChainConstants.constants?.ROUTER[rate || '']);
}
export function useFactoryContract(rate?: string) {
  const factoryContract = ChainConstants.constants.FACTORY[rate || ''];
  return useContract(factoryContract);
}
