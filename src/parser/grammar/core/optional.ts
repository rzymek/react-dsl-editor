import { GrammarNode, isParserError, ParserContext, success } from '../../types';

export function optional<T extends string>(child: GrammarNode<T>) {
  const grammar: GrammarNode<T> = {
    type: 'optional' as T,
    suggestions: () => ['', ...child.suggestions()],
    children: [child],
    parse(text: string, _context: ParserContext<T>) {
      const context:ParserContext<T> = {
        ..._context,
        path: [..._context.path, grammar],
      };
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
