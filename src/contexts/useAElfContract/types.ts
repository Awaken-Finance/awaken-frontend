import { AElfContract } from 'types';

export type ContractKEYS = string;
export type ContractContextState = {
  [x in ContractKEYS]: AElfContract;
};
