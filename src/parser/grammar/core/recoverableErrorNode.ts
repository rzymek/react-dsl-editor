import { GrammarNode, ParserContext, ParserSuccess, success } from '../../types';

export function recoverableError<T extends string>(type: string, text: string): ParserSuccess<T> {
  const errorNode: GrammarNode = {
    type: type as never,
    suggestions: () => [],
    children: [],
    parse(text) {
      return success({
        text: text.substring(0, 1),
        grammar: errorNode,
        recoverableError: true,
        children: [],
      });
    },
  };
  return errorNode.parse(text, {} as ParserContext) as ParserSuccess<T>;
}