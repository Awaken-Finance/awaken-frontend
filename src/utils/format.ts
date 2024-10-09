import { DEFAULT_CHAIN } from 'constants/index';

export const padWithZero = (num: number) => {
  return num < 10 ? '0' + num : num.toString();
};

export const formatDefaultAddress = (addr: string) => {
  return `ELF_${addr}_${DEFAULT_CHAIN}`;
};
