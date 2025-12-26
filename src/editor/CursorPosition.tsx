import { forwardRef, useImperativeHandle, useRef } from 'react';
import { ReadOnlyTextarea } from './ReadOnlyTextarea';

export interface CursorPositionHandle {
  getCursorPosition(): { top: number, left: number };
}

export const CursorPosition = forwardRef(function CursorPosition(props: {
  text: string,
  wrap: boolean,
}, ref) {
  const cursor = useRef<HTMLSpanElement>(null);
  const area = useRef<HTMLPreElement>(null);

  useImperativeHandle(ref, () => ({
    getCursorPosition() {
      if (!cursor.current || !area.current) {
        return {top: 0, left: 0};
      }
      const {offsetTop, offsetLeft} = cursor.current;
      const {scrollTop, scrollLeft} = area.current;
      const style = window.getComputedStyle(area.current);
      const lineHeight = parseInt(style.lineHeight);
      return {top: offsetTop - scrollTop + lineHeight, left: offsetLeft - scrollLeft};
    },
  }), []);

  return <ReadOnlyTextarea ref={area} wrap={props.wrap} style={{visibility: 'hidden'}}>
    {props.text}<span ref={cursor}>&nbsp;</span>
  </ReadOnlyTextarea>;
})