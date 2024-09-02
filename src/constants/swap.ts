import { FontColor } from 'utils/getFontStyle';

export enum SupportedSwapRate {
  percent_0_05 = '0.05',
  percent_0_3 = '0.3',
  percent_1 = '0.1',
  percent_3 = '3',
  percent_5 = '5',
}

export const SupportedSwapRateMap: {
  [key: string]: SupportedSwapRate;
} = {
  '0.0005': SupportedSwapRate.percent_0_05,
  '0.003': SupportedSwapRate.percent_0_3,
  '0.001': SupportedSwapRate.percent_1,
  '0.03': SupportedSwapRate.percent_3,
  '0.05': SupportedSwapRate.percent_5,
};

export const SupportedSwapRateTipMap = {
  [SupportedSwapRate.percent_0_05]: 'percent_0_05Tip',
  [SupportedSwapRate.percent_1]: 'percent_1Tip',
  [SupportedSwapRate.percent_0_3]: 'percent_0_3Tip',
  [SupportedSwapRate.percent_3]: 'percent_3Tip',
  [SupportedSwapRate.percent_5]: 'percent_5Tip',
};

export type SupportedSwapRateIndex = keyof typeof SupportedSwapRate;

export enum SupportedSwapRateKeys {
  '0.05%' = 'percent_0_05',
  '0.3%' = 'percent_0_3',
  '0.1%' = 'percent_1',
  '3%' = 'percent_3',
  '5%' = 'percent_5',
}

export type SupportedSwapRateKeysIndex = keyof typeof SupportedSwapRateKeys;

export const DEFAULT_SLIPPAGE_TOLERANCE = '0.005';

export const DEFAULT_EXPIRATION = '20';

export const SIDE_COLOR_MAP: Record<number, FontColor> = {
  [0]: 'rise',
  [1]: 'fall',
  [2]: 'one',
};

export const SIDE_LABEL_MAP: Record<number, string> = {
  [0]: 'buy',
  [1]: 'sell',
  [2]: 'Swap',
};

export const SWAP_LABS_FEE_RATE = 15;

export const LIMIT_LABS_FEE_RATE = 5;
