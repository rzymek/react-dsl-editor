import {error, GrammarNode, isParserError, ParserContext, ParserError, ParserSuccess, success} from '../../types';
import {pickFromErrorLabels} from "./pickFromErrorLabels";
import {getCommonPrefix} from "../../getCommonPrefix";

function isTotalFailureErrorLabel(result: ParserSuccess<string>) {
  if(!result.errorLabel) {
    return false;
  }
  const prefix = getCommonPrefix(result.text, result.errorLabel.got)
  return prefix.length >= result.text.length/2;
}

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
        if (isParserError(result) || isTotalFailureErrorLabel(result)) {
          if (i >= min) {
            return success({
              grammar,
              children,
              text: text.substring(0, offset),
            });
          } else {
            const err = isParserError(result) ? result : result.errorLabel!
            const error: ParserError<T> =  {...err, offset};
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
        : pickFromErrorLabels(children)?.errorLabel
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

