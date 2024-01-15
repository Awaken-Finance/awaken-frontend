import BigNumber from 'bignumber.js';
import { ContractBasic } from '../utils/contract';
import { isUserDenied } from '../utils';
import { message } from 'antd';
import { ChainConstants } from 'constants/ChainConstants';
import { REQ_CODE } from 'constants/misc';
import { getLPSymbol } from 'utils/swap';
import i18n from 'i18n';
import { timesDecimals } from 'utils/calculate';
import { IContract } from 'types';
import { getContractBasicAsync } from 'aelf-web-login';
import { WebLoginInstance } from 'utils/webLogin';
// elf
export const getELFChainBalance = async (tokenContract: IContract, symbol: string, account: string) => {
  const balance = await tokenContract.callViewMethod('GetBalance', {
    symbol: symbol,
    owner: account,
  });
  return balance?.balance ?? balance?.amount ?? 0;
};

export const checkElfChainAllowanceAndApprove = async ({
  tokenContract,
  approveTargetAddress,
  account,
  contractUseAmount,
  pivotBalance,
  symbol,
}: {
  tokenContract: ContractBasic;
  approveTargetAddress: string;
  account: string;
  contractUseAmount?: string | number;
  pivotBalance?: string | number;
  symbol: string;
}): Promise<boolean | any> => {
  const [allowance, info] = await Promise.all([
    tokenContract.callViewMethod('GetAllowance', [symbol, account, approveTargetAddress]),
    tokenContract.callViewMethod('GetTokenInfo', [symbol]),
  ]);
  if (allowance.error) {
    return allowance;
  }
  const allowanceBN = new BigNumber(allowance.allowance ?? allowance.amount ?? 0);
  const pivotBalanceBN = contractUseAmount
    ? new BigNumber(contractUseAmount)
    : timesDecimals(pivotBalance, info.decimals ?? 8);
  if (allowanceBN.lt(pivotBalanceBN)) {
    const approveResult = await tokenContract.callSendMethod('approve', account, [
      approveTargetAddress,
      symbol,
      pivotBalanceBN,
    ]);
    if (approveResult.error) {
      return approveResult;
    } else {
      return approveResult;
    }
  }
  return true;
};

export const checkELFApprove = async (
  symbol: string,
  account: string,
  approveTargetAddress: string,
  contractUseAmount?: string | number,
  pivotBalance?: string | number,
  lpTokenAddress?: string,
): Promise<boolean | any> => {
  const { walletType, wallet } = WebLoginInstance.get().getWebLoginContext();
  const tokenAddress = lpTokenAddress || (ChainConstants.constants?.TOKEN_CONTRACT as string);
  const tokenContract = await getContractBasicAsync(walletType, wallet, tokenAddress);
  const approveResult = await checkElfChainAllowanceAndApprove({
    tokenContract: tokenContract as IContract,
    approveTargetAddress,
    account,
    contractUseAmount,
    pivotBalance,
    symbol: lpTokenAddress ? getLPSymbol(symbol) : symbol,
  });

  if (typeof approveResult !== 'boolean' && approveResult.error) {
    message.error(i18n.t('Approval Failed'));
    message.error(approveResult.error.message);
    if (isUserDenied(approveResult.error.message)) return REQ_CODE.UserDenied;
    return REQ_CODE.Fail;
  }
  return REQ_CODE.Success;
};

export const checkELFApproveWith = async (
  symbol: string,
  account: string,
  approveTargetAddress: string,
  contractUseAmount?: string | number,
  pivotBalance?: string | number,
  lpTokenAddress?: string,
  lpTokenContract?: IContract,
): Promise<boolean | any> => {
  const tokenContract = lpTokenContract;
  const approveResult = await checkElfChainAllowanceAndApprove({
    tokenContract: tokenContract,
    approveTargetAddress,
    account,
    contractUseAmount,
    pivotBalance,
    symbol: lpTokenAddress ? getLPSymbol(symbol) : symbol,
  });

  if (typeof approveResult !== 'boolean' && approveResult.error) {
    message.error(i18n.t('Approval Failed'));
    message.error(approveResult.error.message);
    if (isUserDenied(approveResult.error.message)) return REQ_CODE.UserDenied;
    return REQ_CODE.Fail;
  }
  return REQ_CODE.Success;
};
