import { isParserError, type Parse } from './types.ts';

export function optional(subparser: Parse, type = 'optional'): Parse {
  return (text) => {
    const result = subparser(text);
    if (isParserError(result)) {
      return {
        type,
        text: '',
      };
    } else {
      return result;
    }
  };
}