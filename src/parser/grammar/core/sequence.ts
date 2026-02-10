import {first, map, pipe} from "remeda";
import {error, GrammarNode, isParserError, ParserContext, ParserSuccess, success} from '../../types';
import {newline} from "../composite";
import {indexOf} from "./indexOf";
import {pickFromErrorLabels} from "./pickFromErrorLabels";

function deepPredicate(node: GrammarNode<string>, predicate: (it: GrammarNode<string>) => boolean) {
  return predicate(node) || node.children.some(predicate);
}

function findIndex(nodes: GrammarNode<string>[], start: number, predicate: (it: GrammarNode<string>) => boolean) {
  for (let i = start; i < nodes.length; i++) {
    if (deepPredicate(nodes[i], predicate)) {
      return i;
    }
  }
  return -1;
}

export function sequence<T extends string>(...nodes: GrammarNode<T>[]): GrammarNode<T> {
  const grammar: GrammarNode<T> = {
    children: nodes,
    type: 'sequence' as T,
    suggestions() {
      return pipe(
        nodes,
        map(it=>it.suggestions()),
        first(),
      ) ?? [];
    },
    parse(text, _context) {
      const context: ParserContext<T> = {
        ..._context,
        path: [..._context.path, grammar],
      };

      let offset = 0;
      const results: ParserSuccess<T>[] = [];
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const rest = text.substring(offset);
        const result = node.parse(rest, context);
        if (isParserError(result)) {
          const err = error({
            ...result,
            offset: result.offset + offset,
          });
          const newlineGrammarIndex = findIndex(nodes, i, it => it.type === newline.type);
          if (newlineGrammarIndex >= 0) {
            const newlineTextIndex = indexOf(text, '\n', offset);
            const textTillEOL = text.substring(offset, newlineGrammarIndex === i ? newlineTextIndex + 1 : newlineTextIndex);
            results.push({
              text: textTillEOL,
              grammar: result.grammar,
              children: [],
              errorLabel: err
            })
            offset += textTillEOL.length;
            i = newlineGrammarIndex - 1;
            continue;
          }
          return err;
        }
        offset += result.text.length;
        results.push(result);
      }
      return success({
        grammar,
        text: text.substring(0, offset),
        children: results,
        errorLabel: pickFromErrorLabels(results)?.errorLabel
      });
    },
  };
  return grammar;
}

