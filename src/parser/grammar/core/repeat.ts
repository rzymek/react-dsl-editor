import {filter, firstBy, pipe} from "remeda";
import {error, GrammarNode, isParserError, ParserContext, ParserError, ParserSuccess, success} from '../../types';

export function repeat<T extends string>(child: GrammarNode<T>, min = 1, max = 1000): GrammarNode<T> {
  const grammar: GrammarNode<T> = {
    type: 'repeat' as T,
    children: [child],
    suggestions: () => child.suggestions(),
    parse(text: string, _context: ParserContext<T>) {
      const context: ParserContext<T> = {
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
          if (i >= min) {
            return success({
              grammar,
              children,
              text: text.substring(0, offset),
            });
          } else {
            const error: ParserError<T> = {...result, offset};
            return error;
          }
        }
        if (result.errorLabel && i > min) {
          break;
        }
        offset += result.text.length;
        children.push(result);
      }
      const errorLabel = i < min
        ? error({
          expected: child.suggestions(),
          got: text,
          grammar,
          offset,
          path: context.path
        })
        : pipe(children,
          filter(it => it.errorLabel !== undefined),
          firstBy(it => it.text.length)
        )?.errorLabel
      return success({
        grammar,
        children,
        text: text.substring(0, offset),
        errorLabel
      });
    },
  };
  return grammar;
}

