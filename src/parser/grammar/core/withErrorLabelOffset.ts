import {ParserError, ParserSuccess} from "../../types";

export function errorLabelOffset<T extends string>(errorLabel: ParserError<T> | undefined, offset: number) {
  return errorLabel ? {
    ...errorLabel,
    offset: errorLabel.offset + offset
  } : undefined;
}

export function withErrorLabelOffset<T extends string>(result: ParserSuccess<T>, offset: number): ParserSuccess<T> {
  return {
    ...result,
    errorLabel: errorLabelOffset(result.errorLabel, offset)
  };
}