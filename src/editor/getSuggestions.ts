import type { SyntaxElement } from './SyntaxHighlighter';
// import * as _ from 'remeda';

export type SuggestionsResult = {
  suggestions: string[],
  prefix: string,
}

export function getSuggestions<T>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  syntax: SyntaxElement<T>[], cursorStart: number, clientSuggestions?: (type: ('error' | T)) => (string[] | undefined),
): SuggestionsResult {
  /*
  const results = _.pipe(
    syntax,
    _.filter(it => it.startOffset <= cursorStart && cursorStart <= Math.max(it.endOffset, it.startOffset + (it.expected ?? '').length)), // syntax elements within cursor position
    _.map((syntaxElement): SuggestionsResult => {
        const suggestions = syntaxElement.expected ? [syntaxElement.expected] : clientSuggestions?.(syntaxElement.name) ?? [];
        const prefix = ((syntaxElement.text || syntaxElement.expected) ?? '').substring(0, cursorStart - syntaxElement.startOffset);
        const filteredSuggestions = suggestions // get suggestion for type
          .filter(suggestion =>
            suggestion.startsWith(prefix),
          ) // filter by prefix
          .filter(suggestion => suggestion.length !== prefix.length); // reject fully written suggestions
        return {suggestions: filteredSuggestions, prefix};
      },
    ),
    _.filter(result => result.suggestions.length > 0), // find the first syntax element with suggestions
    _.take(1),
  );
  const [result] = results;
  return result ? {
    suggestions: _.unique(result.suggestions),
    prefix: result.prefix,
  } : {
    suggestions: [],
    prefix: '',
  };*/
  return {
    suggestions: [],
    prefix: '',
  };
}
