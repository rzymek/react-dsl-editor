import {GrammarNode, isParserError, ParserContext, ParserError, ParserSuccess, success} from '../../types';

export function repeat<T extends string>(child: GrammarNode<T>, min = 1, max = 1000): GrammarNode<T> {
  const grammar: GrammarNode<T> = {
    type: 'repeat' as T,
    children: [child],
    suggestions: () => child.suggestions(),
    parse(text: string, _context: ParserContext<T>) {
      const context:ParserContext<T> = {
        ..._context,
        path: [..._context.path, grammar],
      };
      let offset = 0;
      const children: ParserSuccess<T>[] = [];
      let i = 0;
      for (; i < max && offset < text.length; i++) {
        const currentText = text.substring(offset);
        const result = child.parse(currentText, context);
        if (isParserError(result)) {
          const error:ParserError<T> = {...result, offset};
          if (i >= min) {
            return success({
              grammar,
              children,
              text: text.substring(0, offset),
            });
          } else {
            return error;
          }
        }
        offset += result.text.length;
        children.push(result);
      }
      return success({
        grammar,
        children,
        text: text.substring(0, offset),
      });
    },
  };
  return grammar;
}

