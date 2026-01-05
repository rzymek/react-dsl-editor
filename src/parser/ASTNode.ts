import { GrammarNode } from './types';

export interface CSTNode<T extends string> {
  text: string,
  offset: number,
  grammar: GrammarNode<T>,
  children?: CSTNode<T>[],
}