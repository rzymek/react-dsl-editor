import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type SyntaxElement, SyntaxHighlighter } from './SyntaxHighlighter';
import { Parser, type Parse, type ParserResult } from '../parser';
import { textSyntax } from '../syntax/textSyntax';
import { getSuggestions } from './getSuggestions';
import { SuggestionsView } from './SuggestionsView';

export function DslEditor<T extends string>(
  {
    code,
    onChange,
    onParsed,
    grammar,
    suggestions: clientSuggestions,
  }: {
    code: string,
    onChange: (text: string) => void,
    onParsed?: (ast: ParserResult<T>) => void,
    grammar: Parse<T>,
    suggestions?: (type: T | 'error') => string[] | undefined,
  }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [syntax, setSyntax] = useState<SyntaxElement<T>[]>([]);
  const parser = useRef<Parser<T>>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  const updateSuggestionsForSyntax = useCallback((_syntax: SyntaxElement<T>[]) => {
    const cursorStart = textarea.current?.selectionStart ?? 0;
    const suggestion = getSuggestions(_syntax, cursorStart, clientSuggestions);
    setSuggestions(suggestion);
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

  return <div style={{display: 'grid', gridTemplateRows: '1fr auto'}}>
    <div style={{position: 'relative', border: '1px solid black', overflow: 'hidden'}}>
      <textarea
        ref={textarea}
        spellCheck={false}
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
        onChange={useCallback((e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value), [onChange])}
      />
      <SyntaxHighlighter syntax={syntax}/>
    </div>
    <SuggestionsView suggestions={suggestions} onSelect={suggestion => onChange(code + suggestion)}/>
  </div>;
}