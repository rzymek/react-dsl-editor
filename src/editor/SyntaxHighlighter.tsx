import {CSSProperties, Ref} from 'react';
import {ReadOnlyTextarea} from './ReadOnlyTextarea';

export interface SyntaxElement<T> {
    expected: string;
    name: T | 'error',
    text: string,
    startOffset: number,
    endOffset: number,
}

export function SyntaxHighlighter<T extends string>({syntax = [], ref, wrap, styles}: {
    syntax: SyntaxElement<T>[],
    ref?: Ref<HTMLPreElement>,
    wrap: boolean,
    styles?: Partial<Record<T | 'error', CSSProperties>>
}) {
    return <ReadOnlyTextarea ref={ref} wrap={wrap}>
        {syntax.map((element, idx) =>
                <span key={`token_${idx}`}
                      className={[element.name].join(' ')}
                      style={styles?.[element.name as T]}>
        {element.text}
      </span>,
        )}
    </ReadOnlyTextarea>;
}

