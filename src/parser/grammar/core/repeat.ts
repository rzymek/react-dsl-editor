import { GrammarNode, isParserError, ParserContext, ParserSuccess, success } from '../../types';

export function repeat<T extends string>(child: GrammarNode<T>, min = 1, max = 1000): GrammarNode<T> {
  const grammar: GrammarNode<T> = {
    type: 'repeat' as T,
    children: [child],
    suggestions: () => child.suggestions(),
    parse(text: string, context: ParserContext) {
      let offset = 0;
      let encounteredFailure = false;
      const children: ParserSuccess<T>[] = [];
      for (let i = 0; i < max && offset < text.length; i++) {
        const currentText = text.substring(offset);
        const result = child.parse(currentText, {
          ...context,
          faultTolerant: context.faultTolerant && !encounteredFailure,
        });
        if (isParserError(result)) {
          const error = {...result, offset};
          if (i >= min) {
            break;
          } else {
            if (!context.faultTolerant) {
              return error;
            } else {
              if (!encounteredFailure) {
                encounteredFailure = true;
                continue;
              }
              return error;
            }
          }
        }
        offset += result.text.length;
        children.push({
          ...result,
          recoverableError: encounteredFailure
        });
      }
      return success({
        grammar,
        children,
        text:
          text.substring(0, offset),
      })
        ;
    },
  };
  return grammar;
}

