import { GrammarNode, isParserError, ParserContext, success } from '../../types';

export function optional<T extends string>(child: GrammarNode<T>) {
  const grammar: GrammarNode<T> = {
    type: 'optional' as T,
    suggestions: () => child.suggestions(),
    children: [child],
    parse(text: string, context: ParserContext) {
      const result = child.parse(text, context);
      if (isParserError(result)) {
        return success({text: '', grammar, children: []});
      } else {
        return result;
      }
    },
  };
  return grammar;
}
