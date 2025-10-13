import type { ParserError } from './types';

export function appendOffset<T extends string>(error: ParserError<T>, offset: number): ParserError<T> {
  return {
    ...error,
    error: {
      ...error.error,
      offset: error.error.offset + offset,
    },
  };
}