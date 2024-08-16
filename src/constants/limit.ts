import { LimitOrderStatusEnum } from 'types/transactions';
import { FontColor } from 'utils/getFontStyle';

export const LIMIT_PRICE_DECIMAL = 8;

export const LIMIT_MAX_BUFFER_RATIO = 1.005;

export type TLimitOrderStatusMapItem = {
  value: LimitOrderStatusEnum;
  label: string;
  color: FontColor;
};
export const LimitOrderStatusMap: Record<LimitOrderStatusEnum, TLimitOrderStatusMapItem> = {
  [LimitOrderStatusEnum.Committed]: {
    value: LimitOrderStatusEnum.Committed,
    label: 'Pending',
    color: 'secondary',
  },
  [LimitOrderStatusEnum.PartiallyFilling]: {
    value: LimitOrderStatusEnum.PartiallyFilling,
    label: 'Partially Filled',
    color: 'rise',
  },
  [LimitOrderStatusEnum.FullFilled]: {
    value: LimitOrderStatusEnum.FullFilled,
    label: 'Filled',
    color: 'rise',
  },
  [LimitOrderStatusEnum.Cancelled]: {
    value: LimitOrderStatusEnum.Cancelled,
    label: 'Canceled',
    color: 'fall',
  },
  [LimitOrderStatusEnum.Expired]: {
    value: LimitOrderStatusEnum.Expired,
    label: 'Expired',
    color: 'two',
  },
  [LimitOrderStatusEnum.Revoked]: {
    value: LimitOrderStatusEnum.Revoked,
    label: 'Revoked',
    color: 'fall',
  },
};

export const LimitOrderCancelAllowStatus = [LimitOrderStatusEnum.PartiallyFilling, LimitOrderStatusEnum.Committed];

export const LimitDetailStatusMap: Record<LimitOrderStatusEnum, TLimitOrderStatusMapItem> = {
  [LimitOrderStatusEnum.Committed]: {
    value: LimitOrderStatusEnum.Committed,
    label: 'Pending',
    color: 'secondary',
  },
  [LimitOrderStatusEnum.PartiallyFilling]: {
    value: LimitOrderStatusEnum.PartiallyFilling,
    label: 'Succeed',
    color: 'rise',
  },
  [LimitOrderStatusEnum.FullFilled]: {
    value: LimitOrderStatusEnum.FullFilled,
    label: 'Filled',
    color: 'rise',
  },
  [LimitOrderStatusEnum.Cancelled]: {
    value: LimitOrderStatusEnum.Cancelled,
    label: 'Canceled',
    color: 'fall',
  },
  [LimitOrderStatusEnum.Expired]: {
    value: LimitOrderStatusEnum.Expired,
    label: 'Expired',
    color: 'two',
  },
  [LimitOrderStatusEnum.Revoked]: {
    value: LimitOrderStatusEnum.Revoked,
    label: 'Revoked',
    color: 'fall',
  },
};

export const LIMIT_TIME_INTERVAL = 10 * 1000;
