import { CSSProperties } from "react";
import type {SuggestionsResult} from "./getSuggestions";

export function SuggestionsMenu({
                                  suggestions,
                                  onSelect,
                                  style,
                                  selectedIndex,
                                  onHover,
                                }: {
  suggestions: SuggestionsResult[],
  onSelect: (suggestion: SuggestionsResult) => void,
  style: CSSProperties,
  selectedIndex: number,
  onHover: (index: number) => void,
}) {
  return <div style={{
    position: 'absolute',
    ...style,
    background: '#252526',
    border: '1px solid #454545',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    color: '#cccccc',
    fontFamily: 'monospace',
    fontSize: '0.9em',
    minWidth: 200,
    zIndex: 100,
  }}>
    {suggestions.map((suggestion, idx) =>
      <div key={idx}
           onClick={() => onSelect(suggestion)}
           onMouseOver={() => onHover(idx)}
           style={{
             cursor: 'pointer',
             padding: '4px 8px',
             backgroundColor: selectedIndex === idx ? '#094771' : 'transparent',
           }}>
        {suggestion.suggestion}
      </div>)}
  </div>;
}