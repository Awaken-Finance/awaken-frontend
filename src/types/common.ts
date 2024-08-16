import { Currency } from '@awaken/sdk-core';

export type GenerateType<T> = {
  [K in keyof T]: T[K];
};

export type PartialOption<T, K extends keyof T> = GenerateType<Partial<Pick<T, K>> & Omit<T, K>>;

export type TCommonAPIResult<T> = {
  code: number;
  data: T;
};

export type TCurrency = Currency & {
  imageUri?: string;
};
