import type { SyntaxElement } from './SyntaxHighlighter';
import * as _ from 'remeda';

export function getSuggestions<T>(syntax: SyntaxElement<T>[], cursorStart: number, clientSuggestions?: (type: ('error' | T)) => (string[] | undefined)) {
  return _.pipe(
    syntax,
    _.filter(it => it.startOffset <= cursorStart && cursorStart <= Math.max(it.endOffset, it.startOffset + (it.expected ?? '').length)), // syntax elements within cursor position
    _.map(syntax => {
        const suggestions = syntax.expected ? [syntax.expected] : clientSuggestions?.(syntax.name) ?? [];
        return suggestions // get suggestion for type
          .filter(suggestion =>
            suggestion.startsWith(syntax.text.substring(0, cursorStart - syntax.startOffset)),
          ) // filter by prefix
          .filter(suggestion => suggestion.length !== cursorStart - syntax.startOffset);
      }, // reject fully written suggestions
    ),
    _.filter(suggestions => suggestions.length > 0), // find the first syntax element with suggestions
    _.take(1),
    _.flat(),
  );
}