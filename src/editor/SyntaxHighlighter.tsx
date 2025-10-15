import { Ref } from 'react';

export interface SyntaxElement<T> {
  name: T | 'error',
  text: string,
  expected?: string | undefined,
  startOffset: number,
  endOffset: number,
}

export function SyntaxHighlighter<T>({syntax = [], ref, wrap}: {
  syntax: SyntaxElement<T>[],
  ref?: Ref<HTMLPreElement>,
  wrap: boolean
}) {
  return (
    <pre ref={ref} style={{
      pointerEvents: 'none',
      margin: 0,
      padding: 3,
      inset: 0,
      position: 'absolute',
      fontSize: '1em',
      fontFamily: 'monospace',
      overflow: 'auto',
      whiteSpace: wrap ? 'pre-wrap' : 'pre'
    }}>
      {syntax.map((element, idx) =>
        <span key={`token_${idx}`} className={[element.name].join(' ')}>
            {element.text}
          </span>,
      )}
    </pre>
  );
}