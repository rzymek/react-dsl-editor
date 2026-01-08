import { CSSProperties, Ref } from 'react';
import { ReadOnlyTextarea } from './ReadOnlyTextarea';
import { isEmpty } from 'remeda';
import { defaultStyleFor } from './defaultStyleFor';
import { CSTNode } from '../parser/CSTNode';

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