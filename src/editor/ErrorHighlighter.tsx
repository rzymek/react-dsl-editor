import {CSSProperties, forwardRef, HTMLAttributes, useEffect, useState} from "react";
import {DSLError} from "../parser";
import {disjointIntervals} from "./disjointIntervals";
import {ReadOnlyTextarea} from "./ReadOnlyTextarea";
import {decorateIntervals} from "./DecorateIntervals";

const squiggly: CSSProperties = {
  textDecorationLine: 'underline',
  textDecorationStyle: 'wavy',
  textDecorationColor: 'red',
};

export const ErrorHighlighter = forwardRef<HTMLPreElement, {
  wrap: boolean,
  children: string,
  errors: DSLError[],
  tooltipProps: HTMLAttributes<HTMLElement>,
}>(function ErrorHighlighter(props, ref) {
  const text = `${props.children} `;
  const errorIntervals = disjointIntervals(props.errors);
  const [tooltip, setTooltip] = useState<{ x: number, y: number, message: string }>();

  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref || !("current" in ref) || !ref.current) return;
      const found = elementBoundingPosition(ref.current.querySelectorAll('span[title]'), e);
      setTooltip(found ? {...found, message: found.element.title} : undefined);
    };
    document.addEventListener('mousemove', listener);
    return () => document.removeEventListener('mousemove', listener);
  }, [ref]);

  const {style:tooltipStyle, ...tooltipProps} = props.tooltipProps;
  if (errorIntervals.length === 0) return <></>;
  return <>
    <ReadOnlyTextarea ref={ref} wrap={props.wrap} style={{color: 'transparent'}}>{
      decorateIntervals(errorIntervals, text, (text, error, index) =>
        <span key={`error-${index}`} style={squiggly} title={error.message}>{text}</span>,
      )}
    </ReadOnlyTextarea>
    {tooltip && <Tooltip {...tooltipProps} style={{left: tooltip.x, top: tooltip.y, ...tooltipStyle}} onClick={() => setTooltip(undefined)}>
      {tooltip.message}
    </Tooltip>}
  </>;
});

function Tooltip(props: HTMLAttributes<HTMLElement>) {
  const {style, children, ...rest} = props;
  return <div {...rest} style={{
    position: 'fixed',
    margin: 4,
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    zIndex: 1000,
    whiteSpace: 'nowrap',
    ...style,
  }}>
    {children}
  </div>
}


function elementBoundingPosition(elements: NodeListOf<HTMLElement>, position: { clientX: number, clientY: number }) {
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const rect = element.getBoundingClientRect();
    if (position.clientX >= rect.left && position.clientX <= rect.right &&
      position.clientY >= rect.top && position.clientY <= rect.bottom) {
      return {
        x: rect.left,
        y: rect.bottom,
        element
      };
    }
  }
  return undefined;
}
