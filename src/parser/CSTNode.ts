import { GrammarNode } from './types';

export interface CSTNode<T extends string> {
  text: string,
  offset: number,
  end: number,
  grammar: GrammarNode<T>,
  children?: CSTNode<T>[],
  recoverableError: boolean,
}