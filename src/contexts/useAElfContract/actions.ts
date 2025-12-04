import { basicActions } from 'contexts/utils';
import { AElfContract } from 'types';

export enum aelfContractActions {
  setContract = 'SET_CONTRACT',
  destroy = 'DESTROY',
}

export const basicAElfContractActions = {
  setContract: (contract: { [key: string]: AElfContract }) =>
    basicActions(aelfContractActions['setContract'], contract),
  aelfContractDestroy: () => basicActions(aelfContractActions['destroy']),
};

export const { setContract, aelfContractDestroy } = basicAElfContractActions;
