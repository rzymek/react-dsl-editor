import { GrammarNode, ParserContext } from '../../types';

export function named<T extends string, K extends string>(name: T, child: GrammarNode<K>) {
  const grammar: GrammarNode<T | K> = {
    ...child,
    type: name,
    parse(text: string, context: ParserContext) {
      return {
        ...child.parse(text, context),
        grammar
      }
    },
  };
  return grammar;
}
