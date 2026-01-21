import { flatMap, pipe, uniqueBy } from 'remeda';
import { cstPathAt } from '../example/cstPathAt';
import { CSTNode } from '../parser/CSTNode';
import {nodeName} from "../parser";

export interface SuggestionsResult {
  suggestion: string,
  prefix: string,
}

export function getSuggestions<T extends string>(
  syntax: CSTNode<T>, cursorStart: number, clientSuggestions: (cstNode: CSTNode<T>) => (string[] | undefined) = () => undefined,
): SuggestionsResult[] {
  console.log('getSuggestions',cursorStart);
  const cstPath = cstPathAt(syntax, cursorStart);
  const nodeSuggestions = pipe(
    cstPath,
    flatMap((node:CSTNode<T>) => {
      if (nodeName(node) !== undefined) {
        const suggestions = clientSuggestions(node);
        if (suggestions) {
          return suggestions.map(suggestion => ({node, suggestion}));
        }
      }
      // if(node.grammar.meta?.regex !== undefined) {
        const autoSuggestions = node.grammar.suggestions();
        return autoSuggestions.map(suggestion => ({node, suggestion}));
      // }
      // return [];
    }),
  );
  console.log({nodeSuggestions});
  return pipe(
    nodeSuggestions,
    flatMap(it => {
      const prefix = it.node.text.substring(0, cursorStart - it.node.offset);
      if (it.suggestion.startsWith(prefix) && it.suggestion.trim().length > 0) {
        return [{suggestion: it.suggestion, prefix}];
      } else {
        return [];
      }
    }),
    uniqueBy(it => it.suggestion)
  );
}
