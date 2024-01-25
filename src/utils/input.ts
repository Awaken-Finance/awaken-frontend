import BigNumber from 'bignumber.js';

export function parseMAXInputChange(value: string, max: BigNumber, min: BigNumber, maxLength?: number) {
  const pivot = new BigNumber(value);
  if (max.lt(pivot)) {
    return max.toFixed() || '';
  } else if (pivot.gt(0)) {
    if (min.gt(pivot)) return min.toFixed();
    const [, dec] = value.split('.');
    return (dec?.length ?? 0) >= (maxLength ?? 18) ? pivot.toFixed(maxLength ?? 18, 1) : value;
  }
  return value;
}
export function parseInputChange(value: string, min?: BigNumber, maxLength?: number) {
  const pivot = new BigNumber(value);
  if (pivot.gt(0)) {
    if (min && min.gt(pivot)) return min.toFixed();
    const [, dec] = value.split('.');
    return (dec?.length ?? 0) >= (maxLength ?? 18) ? pivot.toFixed(maxLength ?? 18, 1) : value;
  }
  if (pivot.isEqualTo(0)) {
    const [, dec] = value.split('.');
    return (dec?.length ?? 0) >= (maxLength ?? 18) ? pivot.toFixed(maxLength ?? 18, 1) : value;
  }
  return value;
}
