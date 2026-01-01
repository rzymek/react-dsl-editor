import type { ParserError } from './types';

export function appendOffset<T extends string>(error: ParserError<T>, offset: number): ParserError<T> {
  return {
    ...error,
    offset: error.offset + offset,
  };
}

export function appendOffsets<T extends string>(errors: ParserError<T>[], offsets: number):ParserError<T>[] {
  return errors.map(error => appendOffset(error, offsets));
}