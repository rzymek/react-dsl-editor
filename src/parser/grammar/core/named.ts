import {GrammarNode, isParserError, ParserContext, success} from '../../types';

export function named<T extends string, K extends string>(name: T, child: GrammarNode<K>) {
  const grammar: GrammarNode<T | K> = {
    meta: {name},
    type: 'named' as T,
    suggestions() {
      return child.suggestions()
    },
    children: [child],
    parse(text: string, context: ParserContext<K>) {
      const parse = child.parse(text, context);
      if (isParserError(parse)) {
        return parse;
      }
      return success({
        text: parse.text,
        grammar,
        children: [parse],
      });
    },
  };
  return grammar;
}

export function nodeName<T extends string>(node: { grammar: GrammarNode<T> }): T | undefined {
  return node.grammar.meta?.name as T;
}