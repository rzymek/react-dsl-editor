import {ParserError} from "./types";

export interface ASTNode<T extends string> {
  type: T,
  text: string,
  children?: ASTNode<T>[],
  suggestions: string[],
  error?: ParserError<T>,
  offset: number,
}