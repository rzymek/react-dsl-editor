import { GrammarNode } from '../../types';
import { ws } from './ws';
import { sequence } from '../core/sequence';

export function seq<T extends string>(...nodes: GrammarNode<T>[]):GrammarNode<T> {
  return sequence(ws, ...nodes.flatMap(it => [it, ws]));
}
