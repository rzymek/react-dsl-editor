import { flatMap, pipe } from 'remeda';
import { CSTNode } from '../parser';
import { cstPathAt } from '../example/cstPathAt';

export interface SuggestionsResult {
  suggestion: string,
  prefix: string,
}

export function getSuggestions<T extends string>(
  syntax: CSTNode<T>, cursorStart: number, clientSuggestions: (cstNode: CSTNode<T>) => (string[] | undefined) = () => undefined,
): SuggestionsResult[] {
  const cstPath = cstPathAt(syntax, cursorStart);
  const nodeSuggestions = pipe(
    cstPath,
    flatMap(node => {
      if (node.grammar.meta?.name !== undefined) {
        const suggestions = clientSuggestions(node);
        if (suggestions) {
          return suggestions.map(suggestion => ({node, suggestion}));
        }
      }
      return node.grammar.suggestions().map(suggestion => ({node, suggestion}));
    }),
  );
  return nodeSuggestions.flatMap(it => {
    const prefix = it.node.text.substring(0, cursorStart - it.node.offset);
    if (it.suggestion.startsWith(prefix)) {
      return [{suggestion: it.suggestion, prefix}];
    } else {
      return [];
    }
  });
}
