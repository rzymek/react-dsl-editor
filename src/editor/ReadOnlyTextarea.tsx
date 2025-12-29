import { CSSProperties, forwardRef, PropsWithChildren } from 'react';
import { textStyle } from './textStyle';

export const ReadOnlyTextarea = forwardRef<HTMLPreElement, PropsWithChildren<{
  wrap: boolean,
  style?: CSSProperties,
}>>(
  function ReadOnlyTextarea({wrap, children, style = {}}, ref) {
    return <pre ref={ref} style={{
      ...textStyle,
      pointerEvents: 'none',
      margin: 0,
      overflow: 'auto',
      whiteSpace: wrap ? 'pre-wrap' : 'pre',
      ...style,
    }}>{children}</pre>;
  });