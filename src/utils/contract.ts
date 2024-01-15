import { sleep } from '.';
import { ChainConstants } from 'constants/ChainConstants';
import { getContractMethods, transformArrayToMap, getTxResult } from './aelfUtils';
import { ChainType } from 'types';
export interface AbiType {
  internalType?: string;
  name?: string;
  type?: string;
  components?: AbiType[];
}
export interface AbiItem {
  constant?: boolean;
  inputs?: AbiType[];
  name?: string;
  outputs?: AbiType[];
  payable?: boolean;
  stateMutability?: string;
  type?: string;
}

export interface ContractProps {
  contractABI?: AbiItem[];
  provider?: undefined;
  contractAddress: string;
  chainId?: number;
  sendContract?: any;
  viewContract?: any;
}

interface ErrorMsg {
  error: {
    name?: string;
    code: number;
    message: string;
  };
}

type CallViewMethod = (
  functionName: string,
  paramsOption?: any,
  callOptions?: {
    defaultBlock: number | string;
    options?: any;
    callback?: any;
  },
) => Promise<any | ErrorMsg>;

type CallSendMethod = (
  functionName: string,
  account: string,
  paramsOption?: any,
  sendOptions?: any,
) => Promise<ErrorMsg> | Promise<any>;

export type ContractBasicErrorMsg = ErrorMsg;

export interface ContractInterface {
  address?: string;
  contractType: string;
  callViewMethod: CallViewMethod;
  callSendMethod: CallSendMethod;
  callSendPromiseMethod: CallSendMethod;
}

export class ContractBasic implements ContractInterface {
  public address?: string;
  public callContract: AElfContractBasic;
  public contractType: ChainType;
  constructor(options: ContractProps) {
    this.address = options.contractAddress;
    this.callContract = new AElfContractBasic(options);
    this.contractType = ChainConstants.chainType;
  }

  public callViewMethod: CallViewMethod = async (
    functionName,
    paramsOption,
    callOptions = { defaultBlock: 'latest' },
  ) => {
    return this.callContract.callViewMethod(functionName, paramsOption);
  };

  public callSendMethod: CallSendMethod = async (functionName, account, paramsOption, sendOptions) => {
    return this.callContract.callSendMethod(functionName, paramsOption);
  };
  public callSendPromiseMethod: CallSendMethod = async (functionName, account, paramsOption, sendOptions) => {
    return this.callContract.callSendPromiseMethod(functionName, paramsOption);
  };
}

type AElfCallViewMethod = (functionName: string, paramsOption?: any) => Promise<any | ErrorMsg>;

type AElfCallSendMethod = (functionName: string, paramsOption?: any) => Promise<ErrorMsg> | Promise<any>;

export class AElfContractBasic {
  public sendContract: any;
  public viewContract?: any;
  public address: string;
  public methods?: any;
  constructor(options: ContractProps) {
    const { sendContract, contractAddress, viewContract } = options;
    this.address = contractAddress;
    this.sendContract = sendContract;
    this.viewContract = viewContract;
    this.getFileDescriptorsSet(this.address);
  }
  getFileDescriptorsSet = async (address: string) => {
    try {
      this.methods = await getContractMethods(address);
    } catch (error) {
      console.log(address, error, '====address-error');

      throw new Error(JSON.stringify(error) + 'address:' + address + 'Contract:' + 'getContractMethods');
    }
  };
  checkMethods = async () => {
    if (!this.methods) await this.getFileDescriptorsSet(this.address);
  };
  public callViewMethod: AElfCallViewMethod = async (functionName, paramsOption) => {
    const contract = this.viewContract || this.sendContract;
    if (!contract) return { error: { code: 401, message: 'Contract init error1' } };
    try {
      await this.checkMethods();
      // TODO upper first letter
      const functionNameUpper = functionName.replace(functionName[0], functionName[0].toLocaleUpperCase());
      const inputType = this.methods[functionNameUpper];
      // console.log(transformArrayToMap(inputType, paramsOption), functionNameUpper, '===callViewMethod');

      const req = await contract[functionNameUpper].call(transformArrayToMap(inputType, paramsOption));
      if (!req?.error && (req?.result || req?.result === null)) return req.result;
      return req;
    } catch (e) {
      return { error: e };
    }
  };

  public callSendMethod: AElfCallSendMethod = async (functionName, paramsOption) => {
    if (!this.sendContract) return { error: { code: 401, message: 'Contract init error2' } };
    if (!ChainConstants.aelfInstance.appName && !ChainConstants.aelfInstance.connected)
      return { error: { code: 402, message: 'connect aelf' } };
    try {
      await this.checkMethods();
      const functionNameUpper = functionName.replace(functionName[0], functionName[0].toLocaleUpperCase());
      const inputType = this.methods[functionNameUpper];
      console.log(transformArrayToMap(inputType, paramsOption), '===callSendMethod');

      const req = await this.sendContract[functionNameUpper](transformArrayToMap(inputType, paramsOption));
      if (req.error) {
        console.log(req.error, '===req.error');

        return {
          error: {
            code: req.error.message?.Code || req.error,
            message: req.errorMessage?.message || req.error.message?.Message,
          },
        };
      }
      const { TransactionId } = req.result || req;
      await sleep(1000);
      const validTxId = await getTxResult(TransactionId);

      return { TransactionId: validTxId };
    } catch (e: any) {
      if (e.message) return { error: e };
      return { error: { message: e.Error || e.Status } };
    }
  };

  public callSendPromiseMethod: AElfCallSendMethod = async (functionName, paramsOption) => {
    if (!this.sendContract) return { error: { code: 401, message: 'Contract init error3' } };
    if (!ChainConstants.aelfInstance.appName) return { error: { code: 402, message: 'connect aelf' } };
    try {
      await this.checkMethods();
      return this.sendContract[functionName](transformArrayToMap(this.methods[functionName], paramsOption));
    } catch (e) {
      return { error: e };
    }
  };
}
