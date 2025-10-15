import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type SyntaxElement, SyntaxHighlighter } from './SyntaxHighlighter';
import { type Parse, Parser, type ParserResult } from '../parser';
import { getSuggestions } from './getSuggestions';
import { unique } from 'remeda';
import { textSyntax } from '../syntax/textSyntax';
import { textStyle } from './textStyle';
import { CursorPosition, CursorPositionHandle } from './CursorPosition';
import { SuggestionsView } from './SuggestionsView';

function SuggestionsMenu({
                           suggestions,
                           onSelect,
                           style,
                           selectedIndex,
                           onHover,
                         }: {
  suggestions: string[],
  onSelect: (suggestion: string) => void,
  style: React.CSSProperties,
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
        {suggestion}
      </div>)}
  </div>;
}

export function DslEditor<T extends string>(
  {
    code,
    onChange,
    onParsed,
    grammar,
    wrap = false,
    suggestions: clientSuggestions,
  }: {
    code: string,
    onChange: (text: string) => void,
    onParsed?: (ast: ParserResult<T>) => void,
    grammar: Parse<T>,
    wrap?: boolean,
    suggestions?: (type: T | 'error') => string[] | undefined,
  }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [syntax, setSyntax] = useState<SyntaxElement<T>[]>([]);
  const [suggestionMenu, setSuggestionMenu] = useState<{ top: number, left: number, visible: boolean }>({
    top: 0,
    left: 0,
    visible: false,
  });
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const parser = useRef<Parser<T>>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const cursor = useRef<CursorPositionHandle>(null);

  const updateSuggestionsForSyntax = useCallback((_syntax: SyntaxElement<T>[]) => {
    const cursorStart = textarea.current?.selectionStart ?? 0;
    const suggestion = getSuggestions(_syntax, cursorStart, clientSuggestions);
    setSuggestions(unique(suggestion));
  }, [clientSuggestions]);

  const updateSuggestions = useMemo(() => function updateSuggestions() {
    return updateSuggestionsForSyntax(syntax);
  }, [syntax, updateSuggestionsForSyntax]);

  useEffect(() => {
    parser.current = new Parser(grammar);
  }, [grammar]);

  useEffect(() => {
    if (!parser.current) {
      return;
    }
    const ast = parser.current.parse(code);
    onParsed?.(ast);
    const syntax = textSyntax(ast, code);
    updateSuggestionsForSyntax(syntax);
    setSyntax(syntax);
  }, [code, onParsed, updateSuggestionsForSyntax]);

  const getCursorCoordinates = useCallback(() => {
    if (!cursor.current) {
      return {top: 0, left: 0};
    }
    return cursor.current.getCursorPosition();
  }, []);

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    if (!textarea.current) return;
    const {selectionStart, selectionEnd} = textarea.current;
    const newCode = code.substring(0, selectionStart) + suggestion + code.substring(selectionEnd);
    onChange(newCode);
    setTimeout(() => {
      if (textarea.current) {
        textarea.current.focus();
        textarea.current.selectionStart = textarea.current.selectionEnd = selectionStart + suggestion.length;
      }
    }, 0);
    setSuggestionMenu(s => ({...s, visible: false}));
  }, [code, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestionMenu.visible) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSuggestionIndex(prevIndex => (prevIndex + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSuggestionIndex(prevIndex => (prevIndex - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (suggestions[suggestionIndex]) {
          handleSuggestionSelect(suggestions[suggestionIndex]);
        }
      } else if (e.key === 'Escape') {
        setSuggestionMenu(s => ({...s, visible: false}));
      }
    } else {
      if (e.key === ' ' && e.ctrlKey) {
        e.preventDefault();
        const {top, left} = getCursorCoordinates();
        setSuggestionIndex(0);
        setSuggestionMenu({visible: true, top, left});
      }
    }
  }, [getCursorCoordinates, suggestionMenu.visible, suggestions, suggestionIndex, handleSuggestionSelect]);

  const highlighterRef = useRef<HTMLPreElement>(null);
  const handleScroll = useCallback(() => {
    if (textarea.current && highlighterRef.current) {
      highlighterRef.current.scrollTop = textarea.current.scrollTop;
      highlighterRef.current.scrollLeft = textarea.current.scrollLeft;
    }
  }, []);

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setSuggestionMenu(s => ({...s, visible: false}));
  }, [onChange]);

  return <div style={{display: 'grid', flex: 1, width: '100%', height: '100%'}}>
    <div style={{position: 'relative', border: '1px solid black', overflow: 'hidden'}}>
      <textarea
        ref={textarea}
        spellCheck={false}
        wrap={wrap ? 'soft' : 'off'}
        style={{
          ...textStyle,
          color: 'transparent',
          background: 'transparent',
          caretColor: 'black',
          border: 'none',
          resize: 'none',
        }}
        value={code}
        onSelect={updateSuggestions}
        onChange={handleChange}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
      />
      <SyntaxHighlighter syntax={syntax} ref={highlighterRef} wrap={wrap}/>
      <CursorPosition ref={cursor} text={code} wrap={wrap}/>
      {suggestionMenu.visible && suggestions.length > 0 &&
          <SuggestionsMenu
              suggestions={suggestions}
              onSelect={handleSuggestionSelect}
              style={{top: suggestionMenu.top, left: suggestionMenu.left}}
              selectedIndex={suggestionIndex}
              onHover={setSuggestionIndex}
          />
      }
    </div>
    <SuggestionsView suggestions={suggestions} onSelect={suggestion => onChange(code + suggestion)}/>
  </div>;
}


