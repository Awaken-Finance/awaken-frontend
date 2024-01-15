import { checkELFApprove } from './elf';

export const checkApprove = async (
  ethereum: undefined,
  // ethereum from token address
  // elf from token symbol
  fromToken: string,
  account: string,
  approveTargetAddress: string,
  contractUseAmount?: string | number,
  pivotBalance?: string | number,
  // elf lp token address
  lpTokenAddress?: string,
): Promise<boolean | any> => {
  return checkELFApprove(fromToken, account, approveTargetAddress, contractUseAmount, pivotBalance, lpTokenAddress);
};
export * from './elf';
