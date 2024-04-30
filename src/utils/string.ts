export function stringCut(str: string, resultLen: number): string {
  if (!str || typeof str !== 'string') {
    return '';
  }

  if (str.length <= resultLen) {
    return str;
  }

  return str.slice(0, resultLen) + '...';
}

export function stringMidShort(str: string, resultLen = 6): string {
  if (!str || typeof str !== 'string') {
    return '';
  }
  if (str.length <= resultLen) {
    return str;
  }
  const preLen = Math.floor(resultLen / 2);
  const subLen = resultLen - preLen;

  return str.substring(0, preLen) + '...' + str.substring(str.length - subLen);
}
