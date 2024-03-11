export function stringCut(str: string, resultLen: number): string {
  if (!str || typeof str !== 'string') {
    return '';
  }

  if (str.length <= resultLen) {
    return str;
  }

  return str.slice(0, resultLen) + '...';
}
