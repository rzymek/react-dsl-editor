import type { Parse } from './types.ts';

export function term(str: string): Parse;
export function term(type: string, str: string): Parse;
export function term(typeOrStr: string, strOrUndefined?: string): Parse {
  const type = strOrUndefined === undefined ? 'term' : typeOrStr;
  const str = strOrUndefined ?? typeOrStr;
  return (text) => {
    if (text.startsWith(str)) {
      return {
        type,
        text: str,
      };
    } else {
      return {
        type,
        error: {
          expected: str,
          got: text,
          offset: 0,
        },
      };
    }
  };
}
