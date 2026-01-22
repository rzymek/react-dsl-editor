export function getCommonPrefix(a: string, b: string): string {
  let i = 0;
  const minLength = Math.min(a.length, b.length);
  while (i < minLength && a[i] === b[i]) {
    i++;
  }
  return a.substring(0, i);
}