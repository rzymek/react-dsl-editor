import {
  type ChangeEvent,
  CSSProperties,
  TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { type SyntaxElement, SyntaxHighlighter } from './SyntaxHighlighter';
import { type Parse, Parser, type ParserResult } from '../parser';
import { getSuggestions, type SuggestionsResult } from './getSuggestions';
import { textSyntax } from '../syntax/textSyntax';
import { textStyle } from './textStyle';
import { CursorPosition, CursorPositionHandle } from './CursorPosition';
import { SuggestionsView } from './SuggestionsView';
import { shortcutName } from './shortcutName';
import { useSyncScroll } from './useSyncScroll';

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
    className = DslEditor.name,
    styles,
    ...textareaProps
  }: {
    code: string,
    onChange: (text: string) => void,
    onParsed?: (ast: ParserResult<T>) => void,
    grammar: Parse<T>,
    wrap?: boolean,
    className?: string,
    styles?: Partial<Record<T | 'error', CSSProperties>>,
    suggestions?: (type: T | 'error') => string[] | undefined,
  } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'wrap'|'onChange'>) {
  const [suggestions, setSuggestions] = useState<SuggestionsResult>({suggestions: [], prefix: ''});
  const [syntax, setSyntax] = useState<SyntaxElement<T>[]>([]);
  const [suggestionMenu, setSuggestionMenu] = useState<{ top: number, left: number, visible: boolean }>({
    top: 0,
    left: 0,
    visible: false,
  });
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [cursorText, setCursorText] = useState('');

  const parser = useRef<Parser<T>>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const cursor = useRef<CursorPositionHandle>(null);
  const highlighter = useRef<HTMLPreElement>(null);

  const updateSuggestionsForSyntax = useCallback((_syntax: SyntaxElement<T>[]) => {
    const cursorStart = textarea.current?.selectionStart ?? 0;
    const suggestion = getSuggestions(_syntax, cursorStart, clientSuggestions);
    setSuggestions(suggestion);
  }, [clientSuggestions]);

  const updateSuggestions = useCallback(() => {
    updateSuggestionsForSyntax(syntax);
    setCursorText(textarea.current?.value?.substring(0, textarea.current?.selectionStart ?? 0) ?? '');
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
    setCursorText(code.substring(0, textarea.current?.selectionStart ?? 0));
  }, [code, onParsed, updateSuggestionsForSyntax]);

  const getCursorCoordinates = useCallback(() =>
    cursor.current?.getCursorPosition?.() ?? {top: 0, left: 0}, []);

  const handleSuggestionSelect = useCallback((suggestion: string) => {
    if (!textarea.current) return;
    const {selectionStart, selectionEnd} = textarea.current;
    const {prefix} = suggestions;
    const newCode = code.substring(0, selectionStart - prefix.length) + suggestion + code.substring(selectionEnd);
    onChange(newCode);
    setTimeout(() => {
      if (textarea.current) {
        textarea.current.focus();
        textarea.current.selectionStart = textarea.current.selectionEnd = selectionStart - prefix.length + suggestion.length;
      }
    }, 0);
    setSuggestionMenu(s => ({...s, visible: false}));
  }, [code, onChange, suggestions]);

  const suggestionMenuKeys = useMemo(() => ({
    ArrowDown() {
      setSuggestionIndex(prevIndex => (prevIndex + 1) % suggestions.suggestions.length);
    },
    ArrowUp() {
      setSuggestionIndex(prevIndex => (prevIndex - 1 + suggestions.suggestions.length) % suggestions.suggestions.length);
    },
    Enter() {
      if (suggestions.suggestions[suggestionIndex]) handleSuggestionSelect(suggestions.suggestions[suggestionIndex]);
    },
    Escape() {
      setSuggestionMenu(s => ({...s, visible: false}));
    },
  }), [handleSuggestionSelect, suggestionIndex, suggestions]);

  const textAreaKeys = useMemo(() => ({
    CtrlSpace() {
      const {top, left} = getCursorCoordinates();
      setSuggestionIndex(0);
      setSuggestionMenu({visible: true, top, left});
    },
  }), [getCursorCoordinates]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const keymap: Record<string, () => void> = suggestionMenu.visible ? suggestionMenuKeys : textAreaKeys;
    const fn = keymap[shortcutName(e)];
    if (fn) {
      e.preventDefault();
      fn();
    }
  }, [suggestionMenu.visible, suggestionMenuKeys, textAreaKeys]);

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setSuggestionMenu(s => ({...s, visible: false}));
    setCursorText(e.target.value.substring(0, e.target.selectionStart));
  }, [onChange]);

  return <div style={{display: 'grid', gridTemplateRows: '1fr auto', flex: 1, width: '100%', height: '100%'}}
              className={className}>
    <div style={{position: 'relative', border: '1px solid black', overflow: 'hidden'}}>
      <textarea
        ref={textarea}
        // @ts-expect-error: workaround for spellCheck
        spellcheck={false}
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
        onScroll={useSyncScroll(highlighter)}
        onKeyDown={handleKeyDown}
        {...textareaProps}
      />
      <SyntaxHighlighter syntax={syntax} ref={highlighter} wrap={wrap} styles={styles}/>
      <CursorPosition ref={cursor} text={cursorText} wrap={wrap}/>
      {suggestionMenu.visible && suggestions.suggestions.length > 0 &&
          <SuggestionsMenu
              suggestions={suggestions.suggestions}
              onSelect={handleSuggestionSelect}
              style={{top: suggestionMenu.top, left: suggestionMenu.left}}
              selectedIndex={suggestionIndex}
              onHover={setSuggestionIndex}
          />
      }
    </div>
    <SuggestionsView suggestions={suggestions.suggestions} onSelect={handleSuggestionSelect}/>
  </div>;
}
