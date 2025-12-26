import { CSSProperties, forwardRef, PropsWithChildren } from 'react';
import { textStyle } from './textStyle';

export const ReadOnlyTextarea = forwardRef(function ReadOnlyTextarea({wrap, children, style = {}}: PropsWithChildren<{
  wrap: boolean,
  style?: CSSProperties,
}>) {
  return <pre style={{
    ...textStyle,
    pointerEvents: 'none',
    margin: 0,
    overflow: 'auto',
    whiteSpace: wrap ? 'pre-wrap' : 'pre',
    ...style,
  }}>{children}</pre>;
})