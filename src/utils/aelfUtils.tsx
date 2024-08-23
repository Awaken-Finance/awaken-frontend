import { message } from 'antd';
import { getExploreLink, shortenString, sleep } from 'utils';
import BigNumber from 'bignumber.js';
import { ContractBasic } from './contract';
import AElf from './aelf';
import { COMMON_PRIVATE } from 'constants/aelf';
import { ChainConstants } from 'constants/ChainConstants';
import storages from 'storages';
import { baseRequest } from 'api';
import descriptor from '@aelfqueen/protobufjs/ext/descriptor';
import { timesDecimals } from './calculate';
import { isSymbol } from './reg';
import { isMobile } from 'react-device-detect';
import { getContractKey } from 'contexts/useAElfContract/utils';
const Wallet = AElf.wallet;

let wallet: any = null;
const httpProviders: any = {};
export function getAElf() {
  const rpc = ChainConstants?.constants?.CHAIN_INFO?.rpcUrl;
  if (!rpc) return;
  if (!httpProviders[rpc]) httpProviders[rpc] = new AElf(new AElf.providers.HttpProvider(rpc));

  return httpProviders[rpc];
}

export function getWallet() {
  if (!wallet) wallet = Wallet.getWalletByPrivateKey(COMMON_PRIVATE);

  return wallet;
}

const CacheViewContracts: { [key: string]: any } = {};

export const getViewContract = async (contractAddress: string, _wallet?: any): Promise<any> => {
  const key = contractAddress;
  if (!CacheViewContracts[key]) {
    if (!_wallet) _wallet = getWallet();
    const aelf = getAElf();
    const contract = await aelf.chain.contractAt(contractAddress, _wallet);
    CacheViewContracts[key] = contract;
    return contract;
  }

  return CacheViewContracts[key];
};

export type TCallViewMethodParams = {
  contractAddress: string;
  methodName: string;
  args: any;
};
export const callViewMethod = async ({ contractAddress, methodName, args }: TCallViewMethodParams) => {
  const _contract = await getViewContract(contractAddress);
  return _contract[methodName].call(args);
};

export const approveELF = async (
  address: string,
  tokenContract: ContractBasic,
  symbol = 'ELF',
  amount: BigNumber | number | string,
) => {
  const approveResult = await tokenContract.callSendMethod('Approve', '', [address, symbol, amount.toString()]);
  if (approveResult.error) {
    message.error(approveResult.error.message || approveResult?.errorMessage?.message || approveResult.errorMessage);
    return false;
  }
  const { TransactionId } = approveResult.result || approveResult;
  console.log(TransactionId, '===TransactionId');

  await MessageTxToExplore(TransactionId);
  return true;
};

export function getBlockHeight() {
  return getAElf().chain.getBlockHeight();
}
export function getSerializedDataFromLog(log: any) {
  return AElf.pbUtils.getSerializedDataFromLog(log);
}

class TXError extends Error {
  public TransactionId?: string;
  public transactionId?: string;
  constructor(message: string, id?: string) {
    super(message);
    this.TransactionId = id;
    this.transactionId = id;
  }
}

export function handleContractErrorMessage(error?: any) {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error.Error) {
    return error.Error.Details || error.Error.Message || error.Error;
  }
  return `Transaction: ${error.Status}`;
}

export async function getTxResult(TransactionId: string, reGetCount = 0, notExistedReGetCount = 0): Promise<any> {
  const txFun = getAElf().chain.getTxResult;
  let txResult;
  try {
    txResult = await txFun(TransactionId);
  } catch (error) {
    throw new TXError(handleContractErrorMessage(error), TransactionId);
  }
  if (txResult?.error && txResult?.errorMessage) {
    throw new TXError(txResult.errorMessage.message || txResult.errorMessage.Message, TransactionId);
  }
  const result = txResult?.result || txResult;
  if (!result) throw new TXError('Can not get transaction result.', TransactionId);
  const lowerCaseStatus = result.Status.toLowerCase();
  if (lowerCaseStatus === 'notexisted') {
    if (notExistedReGetCount > 5) throw new TXError(result.Error || `Transaction: ${result.Status}`, TransactionId);
    await sleep(1000);
    notExistedReGetCount++;
    reGetCount++;
    return getTxResult(TransactionId, reGetCount, notExistedReGetCount);
  }
  if (lowerCaseStatus === 'pending' || lowerCaseStatus === 'pending_validation') {
    if (reGetCount > 20) throw new TXError(result.Error || `Transaction: ${result.Status}`, TransactionId);
    await sleep(1000);
    reGetCount++;
    return getTxResult(TransactionId, reGetCount, notExistedReGetCount);
  }
  if (lowerCaseStatus === 'mined') return TransactionId;
  throw new TXError(result.Error || `Transaction: ${result.Status}`, TransactionId);
}

export function messageHTML(txId: string, type: 'success' | 'error' | 'warning' = 'success', moreMessage = '') {
  const aProps = isMobile ? {} : { target: '_blank', rel: 'noreferrer' };
  const explorerHref = getExploreLink(txId, 'transaction');
  const txIdHTML = (
    <span>
      <span>
        Transaction Id: &nbsp;
        <a href={explorerHref} style={{ wordBreak: 'break-all' }} {...aProps}>
          {shortenString(txId || '', 8)}
        </a>
      </span>
      <br />
      {moreMessage && <span>{moreMessage.replace('AElf.Sdk.CSharp.AssertionException:', '')}</span>}
    </span>
  );
  message[type](txIdHTML, 10);
}

export async function MessageTxToExplore(txId: string, type: 'success' | 'error' | 'warning' = 'success') {
  try {
    const validTxId = await getTxResult(txId);
    messageHTML(validTxId, type);
  } catch (e: any) {
    if (e.TransactionId) {
      messageHTML(txId, 'error', e.Error || 'Transaction error.');
    } else {
      messageHTML(txId, 'error', e.message || 'Transaction error.');
    }
  }
}
export const checkElfAllowanceAndApprove = async (
  tokenContract: ContractBasic,
  symbol: string,
  address: string,
  approveTargetAddress: string,
  amount: string | number,
): Promise<
  | boolean
  | {
      error: Error;
    }
> => {
  const [allowance, tokenInfo] = await Promise.all([
    tokenContract.callViewMethod('GetAllowance', [symbol, address, approveTargetAddress]),
    tokenContract.callViewMethod('GetTokenInfo', [symbol]),
  ]);
  if (allowance?.error) {
    message.error(allowance.error.message || allowance.errorMessage?.message || allowance.errorMessage);
    return false;
  }
  console.log(tokenInfo, 'tokenInfo====');
  const bigA = timesDecimals(amount, tokenInfo?.decimals ?? 8);
  const allowanceBN = new BigNumber(allowance?.allowance);
  if (allowanceBN.lt(bigA)) {
    return await approveELF(approveTargetAddress, tokenContract, symbol, bigA);
  }
  return true;
};

export async function getELFContract(contractAddress: string, aelfInstance: any, account?: string) {
  const viewInstance = getAElf();
  const wallet = account ? { address: account } : getWallet();
  if (aelfInstance.connect) {
    const [viewContract, sendContract] = await Promise.all([
      viewInstance?.chain.contractAt(contractAddress, getWallet()),
      aelfInstance?.chain.contractAt(contractAddress, wallet),
    ]);
    return { viewContract, sendContract };
  }
  const sendContract = await aelfInstance?.chain.contractAt(contractAddress, wallet);
  return { viewContract: sendContract, sendContract };
}

export async function initContracts(contracts: { [name: string]: string }, aelfInstance: any, account?: string) {
  const contractList = Object.entries(contracts);
  try {
    const list = await Promise.all(
      contractList.map(async ([, address]) => {
        try {
          const contract = await getELFContract(address, aelfInstance, account);
          return contract;
        } catch (error) {
          return undefined;
        }
      }),
    );
    const obj: any = {};
    contractList.forEach(([, value], index) => {
      obj[getContractKey(value, ChainConstants.chainId, account)] = list[index];
    });

    return obj;
  } catch (error) {
    console.log(error, 'initContracts');
  }
}
function setContractsFileDescriptorBase64(contracts: any) {
  localStorage.setItem(storages.contractsFileDescriptorBase64, JSON.stringify(contracts));
}
function fileDescriptorSetFormatter(result: any) {
  const buffer = Buffer.from(result, 'base64');
  return descriptor.FileDescriptorSet.decode(buffer);
}
export async function getContractFileDescriptorSet(address: string): Promise<any> {
  let base64s: any = localStorage.getItem(storages.contractsFileDescriptorBase64);
  base64s = JSON.parse(base64s);
  if (base64s && base64s[address]) {
    try {
      return fileDescriptorSetFormatter(base64s[address]);
    } catch (error) {
      delete base64s[address];
      setContractsFileDescriptorBase64(base64s);
      return getContractFileDescriptorSet(address);
    }
  } else {
    try {
      if (!base64s) base64s = {};
      console.log(ChainConstants.constants.CHAIN_INFO.rpcUrl, 'ChainConstants.constants.CHAIN_INFO.rpcUrl');
      const base64 = await baseRequest({
        url: `${ChainConstants.constants.CHAIN_INFO.rpcUrl}/api/blockChain/contractFileDescriptorSet`,
        params: { address },
      });
      const fds = fileDescriptorSetFormatter(base64);
      base64s[address] = base64;
      setContractsFileDescriptorBase64(base64s);
      return fds;
    } catch (error) {
      console.debug(error, '======getContractFileDescriptorSet');
    }
  }
}

export const getServicesFromFileDescriptors = (descriptors: any) => {
  const root = AElf.pbjs.Root.fromDescriptor(descriptors, 'proto3').resolveAll();
  return descriptors.file
    .filter((f: any) => f.service.length > 0)
    .map((f: any) => {
      const sn = f.service[0].name;
      const fullName = f.package ? `${f.package}.${sn}` : sn;
      return root.lookupService(fullName);
    });
};
const isWrappedBytes = (resolvedType: any, name: string) => {
  if (!resolvedType.name || resolvedType.name !== name) {
    return false;
  }
  if (!resolvedType.fieldsArray || resolvedType.fieldsArray.length !== 1) {
    return false;
  }
  return resolvedType.fieldsArray[0].type === 'bytes';
};
const isAddress = (resolvedType: any) => isWrappedBytes(resolvedType, 'Address');

const isHash = (resolvedType: any) => isWrappedBytes(resolvedType, 'Hash');
export function transformArrayToMap(inputType: any, origin: any[]) {
  if (!origin) return '';
  if (Array.isArray(origin) && origin.length === 0) return '';
  if (!Array.isArray(origin) || isAddress(inputType) || isHash(inputType)) return origin;

  const { fieldsArray } = inputType || {};
  const fieldsLength = (fieldsArray || []).length;

  if (fieldsLength === 0) return origin;

  if (fieldsLength === 1) {
    const i = fieldsArray[0];
    return { [i.name]: origin[0] };
  }

  let result = origin;
  Array.isArray(fieldsArray) &&
    Array.isArray(origin) &&
    fieldsArray.forEach((i, k) => {
      result = {
        ...result,
        [i.name]: origin[k],
      };
    });
  return result;
}

export async function getContractMethods(address: string) {
  const fds = await getContractFileDescriptorSet(address);
  const services = getServicesFromFileDescriptors(fds);
  const obj: any = {};
  Object.keys(services).forEach((key) => {
    const service = services[key];
    Object.keys(service.methods).forEach((key) => {
      const method = service.methods[key].resolve();
      obj[method.name] = method.resolvedRequestType;
    });
  });
  return obj;
}

export const isElfChainSymbol = (symbol?: string | null) => {
  if (symbol && symbol.length >= 1 && symbol.length <= 50 && isSymbol(symbol)) return symbol;
  return false;
};

export const isELFChain = (chainId?: string | number) => {
  if (typeof chainId === 'string') return chainId;
  return false;
};
