import {
  type ChangeEvent,
  CSSProperties,
  HTMLAttributes,
  TextareaHTMLAttributes,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {SyntaxColorsProvider, SyntaxHighlighter} from './SyntaxHighlighter';
import {getSuggestions, type SuggestionsResult} from './getSuggestions';
import {textStyle} from './textStyle';
import {CursorPosition, CursorPositionHandle} from './CursorPosition';
import {shortcutName} from './shortcutName';
import {useSyncScroll} from './useSyncScroll';
import {GrammarNode} from '../parser/types';
import {CSTNode} from '../parser/CSTNode';
import {DSL, DSLParser} from '../parser/DSLParser';
import {isEmpty} from 'remeda';
import {defaultSyntaxColors} from './defaultStyleFor';
import {ErrorHighlighter} from "./ErrorHighlighter";

function getCursorCoordinates(cursor: CursorPositionHandle | null) {
  return cursor?.getCursorPosition?.() ?? {top: 0, left: 0};
}

function SuggestionsMenu({
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

export function DslEditor<T extends string>(
  {
    code,
    onChange,
    onParsed,
    grammar,
    wrap = false,
    tooltipProps = {style: {backgroundColor: 'darkGray'}},
    suggestions: clientSuggestions,
    validate,
    className = DslEditor.name,
    syntaxColors = defaultSyntaxColors('light'),
    ...textareaProps
  }: {
    code: string,
    onChange: (text: string) => void,
    onParsed?: (dsl: DSL<T>) => void,
    grammar: GrammarNode<T>,
    wrap?: boolean,
    className?: string,
    tooltipProps?: HTMLAttributes<HTMLElement>,
    validate?: (node: T, text: string) => string | undefined,
    suggestions?: (node: CSTNode<T>) => string[] | undefined,
    syntaxColors?: SyntaxColorsProvider,
  } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'wrap' | 'onChange'>) {
  const [suggestions, setSuggestions] = useState<SuggestionsResult[]>([]);
  const [parserResult, setParserResult] = useState<DSL<T>>();
  const [suggestionMenu, setSuggestionMenu] = useState({
    top: 0,
    left: 0,
    cursorPosition: false,
    visible: false,
  });
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [cursorText, setCursorText] = useState('');

  const textarea = useRef<HTMLTextAreaElement>(null);
  const cursor = useRef<CursorPositionHandle>(null);
  const highlighter = useRef<HTMLPreElement>(null);
  const errorHighlighter = useRef<HTMLPreElement>(null);

  const updateSuggestionsForSyntax = useCallback((cst: CSTNode<T>) => {
    const cursorStart = textarea.current?.selectionStart ?? 0;
    const suggestions = getSuggestions(cst, cursorStart, clientSuggestions);
    setSuggestions(suggestions);
    return suggestions;
  }, [clientSuggestions]);

  const handleCursor = useCallback(() => {
    if (!parserResult) {
      return;
    }
    setCursorText(textarea.current?.value?.substring(0, textarea.current?.selectionStart ?? 0) ?? '');
  }, [parserResult]);

  useEffect(() => {
    const dslParser = validate ? new class ValidatingParser extends DSLParser<T> {
      constructor() {
        super(grammar);
      }

      protected validate(node: T, text: string): string | undefined {
        return validate(node, text);
      }
    } : new DSLParser(grammar);
    const result = dslParser.parse(code);
    setParserResult(result);
    onParsed?.(result);
    updateSuggestionsForSyntax(result.cst);
    setCursorText(code.substring(0, textarea.current?.selectionStart ?? 0));
  }, [code, onParsed, grammar, updateSuggestionsForSyntax, validate]);

  const handleSuggestionSelect = useCallback((suggestion: SuggestionsResult) => {
    if (!textarea.current) return;
    const {selectionStart, selectionEnd} = textarea.current;
    const {prefix} = suggestion;
    const newCode = code.substring(0, selectionStart - prefix.length) + suggestion.suggestion + code.substring(selectionEnd);
    onChange(newCode);
    setTimeout(() => {
      if (textarea.current) {
        textarea.current.focus();
        textarea.current.selectionStart = textarea.current.selectionEnd = selectionStart - prefix.length + suggestion.suggestion.length;
      }
    }, 0);
    setSuggestionMenu(s => ({...s, visible: false}));
  }, [code, onChange]);

  const suggestionMenuKeys = useMemo(() => ({
    ArrowDown() {
      setSuggestionIndex(prevIndex => (prevIndex + 1) % suggestions.length);
    },
    ArrowUp() {
      setSuggestionIndex(prevIndex => (prevIndex - 1 + suggestions.length) % suggestions.length);
    },
    Enter() {
      if (suggestions[suggestionIndex]) handleSuggestionSelect(suggestions[suggestionIndex]);
    },
    Escape() {
      setSuggestionMenu(s => ({...s, visible: false}));
    },
  }), [handleSuggestionSelect, suggestionIndex, suggestions]);

  const textAreaKeys = useMemo(() => ({
    CtrlSpace() {
      if (!parserResult?.cst) return;
      const suggestions = updateSuggestionsForSyntax(parserResult?.cst);
      if (isEmpty(suggestions)) {
        return;
      }
      setSuggestionMenu({cursorPosition: true, visible: false, top: 0, left: 0});
    },
  }), [parserResult?.cst, updateSuggestionsForSyntax]);

  useEffect(() => {
    if (suggestionMenu.cursorPosition) {
      const {top, left} = getCursorCoordinates(cursor.current);
      setSuggestionIndex(0);
      setSuggestionMenu({cursorPosition: false, visible: true, top, left});
    }
  }, [suggestionMenu.cursorPosition]);

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
        spellCheck={false}
        wrap={wrap ? 'soft' : 'off'}
        style={textStyle}
        value={code}
        onSelect={handleCursor}
        onChange={handleChange}
        onScroll={useSyncScroll(highlighter, errorHighlighter)}
        onKeyDown={handleKeyDown}
        {...textareaProps}
      />
      {parserResult &&
          <SyntaxHighlighter cstRoot={parserResult.cst} ref={highlighter} wrap={wrap} syntaxColors={syntaxColors}/>}
      {!isEmpty(parserResult?.errors ?? []) &&
          <ErrorHighlighter ref={errorHighlighter} errors={parserResult?.errors ?? []}
                            tooltipProps={tooltipProps}
                            wrap={wrap}>{code}</ErrorHighlighter>}

      {suggestionMenu.cursorPosition && <CursorPosition ref={cursor} text={cursorText} wrap={wrap}/>}
      {suggestionMenu.visible && <SuggestionsMenu
          suggestions={suggestions}
          onSelect={handleSuggestionSelect}
          style={{top: suggestionMenu.top, left: suggestionMenu.left}}
          selectedIndex={suggestionIndex}
          onHover={setSuggestionIndex}
      />
      }
    </div>
    {/*{JSON.stringify(parserResult?.errors ?? [])}*/}
    {/*<SuggestionsView suggestions={suggestions.map(it => it.suggestion)} onSelect={handleSuggestionSelect}/>*/}
  </div>;
}
