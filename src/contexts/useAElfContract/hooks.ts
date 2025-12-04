import { ContractKEYS } from './types';
import { useAElfContract as useAElfContractHook } from 'hooks/useContract';

export function useAElfContract(contractAddress: ContractKEYS) {
  return useAElfContractHook(contractAddress);
}
