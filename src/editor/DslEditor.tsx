import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type SyntaxElement, SyntaxHighlighter } from './SyntaxHighlighter';
import { Parser, type Parse, type ParserResult } from '../parser';
import { getSuggestions } from './getSuggestions';
import { unique } from 'remeda';
import { textSyntax } from '../syntax/textSyntax';

function SuggestionsMenu({
                           suggestions,
                           onSelect,
                           style
                         }: { suggestions: string[], onSelect: (suggestion: string) => void, style: React.CSSProperties }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
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
           onMouseOver={() => setSelectedIndex(idx)}
           style={{
             cursor: 'pointer',
             padding: '4px 8px',
             backgroundColor: selectedIndex === idx ? '#094771' : 'transparent'
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
    visible: false
  });
  const parser = useRef<Parser<T>>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

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
    if (!textarea.current) return { top: 0, left: 0 };

    const ta = textarea.current;
    const parent = ta.parentElement;
    if (!parent) return { top: 0, left: 0 };

    const pre = document.createElement('pre');
    const style = window.getComputedStyle(ta);
    pre.style.font = style.font;
    pre.style.whiteSpace = wrap ? 'pre-wrap' : 'pre';
    pre.style.wordWrap = 'break-word';
    pre.style.padding = style.padding;
    pre.style.position = 'absolute';
    pre.style.visibility = 'hidden';
    pre.style.top = style.top;
    pre.style.left = style.left;
    pre.style.width = ta.clientWidth + 'px';

    const text = ta.value.substring(0, ta.selectionStart);
    pre.textContent = text;

    const span = document.createElement('span');
    span.textContent = '.'; // Placeholder
    pre.appendChild(span);

    parent.appendChild(pre);

    const { offsetTop, offsetLeft } = span;
    const { scrollTop, scrollLeft } = ta;

    parent.removeChild(pre);

    const lineHeight = parseInt(style.lineHeight) || (parseInt(style.fontSize) * 1.2);

    return { top: offsetTop - scrollTop + lineHeight, left: offsetLeft - scrollLeft };
  }, [wrap]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === ' ' && e.ctrlKey) {
      e.preventDefault();
      const { top, left } = getCursorCoordinates();
      setSuggestionMenu({ visible: true, top, left });
      updateSuggestions();
    } else if (e.key === 'Escape') {
      setSuggestionMenu(s => ({ ...s, visible: false }));
    }
  }, [getCursorCoordinates, updateSuggestions]);

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    if (!textarea.current) return;
    const { selectionStart, selectionEnd } = textarea.current;
    const newCode = code.substring(0, selectionStart) + suggestion + code.substring(selectionEnd);
    onChange(newCode);
    setTimeout(() => {
      if (textarea.current) {
        textarea.current.focus();
        textarea.current.selectionStart = textarea.current.selectionEnd = selectionStart + suggestion.length;
      }
    }, 0);
    setSuggestionMenu(s => ({ ...s, visible: false }));
  }, [code, onChange]);

  const highlighterRef = useRef<HTMLPreElement>(null);
  const handleScroll = useCallback(() => {
    if (textarea.current && highlighterRef.current) {
      highlighterRef.current.scrollTop = textarea.current.scrollTop;
      highlighterRef.current.scrollLeft = textarea.current.scrollLeft;
    }
  }, []);

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setSuggestionMenu(s => ({ ...s, visible: false }));
  }, [onChange]);

  return <div style={{ display: 'grid', flex: 1, width: '100%', height: '100%' }}>
    <div style={{ position: 'relative', border: '1px solid black', overflow: 'hidden' }}>
      <textarea
        ref={textarea}
        spellCheck={false}
        wrap={wrap ? 'soft' : 'off'}
        style={{
          position: 'absolute',
          inset: 0,
          fontSize: '1em',
          fontFamily: 'monospace',
          color: 'transparent',
          background: 'transparent',
          caretColor: 'black',
          border: 'none',
          resize: 'none',
          overflow: 'auto',
          padding: 3,
        }}
        value={code}
        onSelect={updateSuggestions}
        onChange={handleChange}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
      />
      <SyntaxHighlighter syntax={syntax} ref={highlighterRef} wrap={wrap}/>
      {suggestionMenu.visible && suggestions.length > 0 &&
        <SuggestionsMenu
          suggestions={suggestions}
          onSelect={handleSuggestionSelect}
          style={{ top: suggestionMenu.top, left: suggestionMenu.left }}
        />
      }
    </div>
  </div>;
}