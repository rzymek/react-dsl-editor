export function SuggestionsView({suggestions, onSelect}: {
  suggestions: string[],
  onSelect: (suggestion: string) => void
}) {
  return <div style={{display: 'flex', gap: 4, padding: '4px 0', overflowY: 'auto'}}>
    {suggestions.map((suggestion, idx) =>
      <button key={idx} onClick={() => onSelect(suggestion)}>
        &nbsp;{suggestion}&nbsp;
      </button>)}
  </div>;
}