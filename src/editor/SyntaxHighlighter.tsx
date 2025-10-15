import { Ref } from 'react';
import { ReadOnlyTextarea } from './ReadOnlyTextarea';

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
  return <ReadOnlyTextarea ref={ref} wrap={wrap}>
    {syntax.map((element, idx) =>
      <span key={`token_${idx}`} className={[element.name].join(' ')}>
        {element.text}
      </span>,
    )}
  </ReadOnlyTextarea>;
}

