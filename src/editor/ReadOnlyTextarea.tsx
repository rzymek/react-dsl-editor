import { CSSProperties, PropsWithChildren, Ref } from 'react';
import { textStyle } from './textStyle';

export function ReadOnlyTextarea({ref, wrap, children, style = {}}: PropsWithChildren<{
  ref?: Ref<HTMLPreElement>,
  wrap: boolean,
  style?: CSSProperties,
}>) {
  return <pre ref={ref} style={{
    ...textStyle,
    pointerEvents: 'none',
    margin: 0,
    overflow: 'auto',
    whiteSpace: wrap ? 'pre-wrap' : 'pre',
    ...style,
  }}>{children}</pre>;
}