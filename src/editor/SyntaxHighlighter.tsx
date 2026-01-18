import { CSSProperties, Ref } from 'react';
import { ReadOnlyTextarea } from './ReadOnlyTextarea';
import { isEmpty } from 'remeda';
import { defaultStyleFor } from './defaultStyleFor';
import { CSTNode } from '../parser/CSTNode';
import { DSLError } from '../parser';

const squiggly: CSSProperties = {
  textDecorationLine: 'underline',
  textDecorationStyle: 'wavy',
  textDecorationColor: 'red',
};

export interface SyntaxElement<T> {
  expected: string;
  name: T | 'error',
  text: string,
  startOffset: number,
  endOffset: number,
}

export function SyntaxHighlighter<T extends string>({cstRoot, ref, wrap}: {
  cstRoot: CSTNode<T>,
  ref?: Ref<HTMLPreElement>,
  wrap: boolean,
}) {
  return <ReadOnlyTextarea ref={ref} wrap={wrap}>
    <StyledNode node={cstRoot} styleFor={defaultStyleFor}/>
  </ReadOnlyTextarea>;
}

export function ErrorHighlighter({ref, wrap, errors, children: text}: {
  ref?: Ref<HTMLPreElement>,
  wrap: boolean,
  children: string,
  errors: DSLError[]
}) {
  const [error] = errors;
  if (!error) return <></>;
  return <ReadOnlyTextarea ref={ref} wrap={wrap} data-id="ErrorHighlighter" style={{color: 'transparent'}}>{
    text.substring(0, error.start)
  }<span style={squiggly} title={error.message}>{text.substring(error.start, error.end)}</span>{
    text.substring(error.end)
  }</ReadOnlyTextarea>;
}

function StyledNode(props: { node: CSTNode<string>, styleFor: (node: CSTNode<string>) => CSSProperties | undefined }) {
  const style = props.styleFor(props.node);
  return <span style={style}>{
    isEmpty(props.node.children ?? [])
      ? props.node.text
      : props.node.children!.map((child, idx) =>
        <StyledNode node={child} styleFor={props.styleFor} key={idx}/>,
      )
  }</span>;
}