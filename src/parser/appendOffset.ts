import type { ParserError } from './types';

export function appendOffset<T>(error: ParserError<T>, offset: number): ParserError<T> {
  return {
    ...error,
    offset: error.offset + offset,
  };
}

export function appendOffsets<T>(errors: ParserError<T>[], offsets: number):ParserError<T>[] {
  return errors.map(error => appendOffset(error, offsets));
}