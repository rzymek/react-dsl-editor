import * as _ from 'remeda';

export function SuggestionsView({suggestions, onSelect}: {
  suggestions: string[],
  onSelect: (suggestion: string) => void
}) {
  return <div style={{display: 'flex', gap: 4, padding: '4px 0', overflowY: 'auto'}}>
    {_.pipe(
      suggestions,
      _.unique(),
      _.map((suggestion, idx) =>
        <button key={idx} onClick={() => onSelect(suggestion)}>
          &nbsp;{suggestion}&nbsp;
        </button>),
    )}
    {/*<pre>{JSON.stringify({cursor: textarea.current?.selectionStart, suggestions, syntax}, null, 2)}</pre>*/}
  </div>;
}