import type { Parser } from './types.ts';

export function pattern(regex: string, type = 'pattern'): Parser {
  return (text) => {
    const rexp = new RegExp(`^${regex}`);
    const match = rexp.exec(text);
    if (match) {
      return {
        type,
        text: match[0],
      };
    } else {
      return {
        type,
        error: `expected '${regex}', got '${text}'`,
      };
    }
  };
}