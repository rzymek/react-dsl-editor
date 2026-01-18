import { CSSProperties, Ref } from 'react';
import { ReadOnlyTextarea } from './ReadOnlyTextarea';
import { isEmpty } from 'remeda';
import { CSTNode } from '../parser/CSTNode';
import { DSLError } from '../parser';

const squiggly: CSSProperties = {
  textDecorationLine: 'underline',
  textDecorationStyle: 'wavy',
  textDecorationColor: 'red',
};

export type SyntaxColorsProvider = (node: CSTNode<string>) => CSSProperties | undefined;

export function SyntaxHighlighter<T extends string>({cstRoot, ref, wrap, syntaxColors}: {
  cstRoot: CSTNode<T>,
  ref?: Ref<HTMLPreElement>,
  wrap: boolean,
  syntaxColors: SyntaxColorsProvider
}) {
  return <ReadOnlyTextarea ref={ref} wrap={wrap}>
    <StyledNode node={cstRoot} styleFor={syntaxColors}/>
  </ReadOnlyTextarea>;
}

export function ErrorHighlighter({ref, wrap, errors, children}: {
  ref?: Ref<HTMLPreElement>,
  wrap: boolean,
  children: string,
  errors: DSLError[]
}) {
  const text = `${children} `;
  const [error] = errors;
  if (!error) return <></>;
  return <ReadOnlyTextarea ref={ref} wrap={wrap} data-id="ErrorHighlighter" style={{color: 'transparent'}}>{
    text.substring(0, error.start)
  }<span style={squiggly} title={error.message}>{text.substring(error.start, error.end)}</span>{
    text.substring(error.end)
  }</ReadOnlyTextarea>;
}

function StyledNode(props: { node: CSTNode<string>, styleFor: SyntaxColorsProvider }) {
  const style = props.styleFor(props.node);
  return <span style={style}>{
    isEmpty(props.node.children ?? [])
      ? props.node.text
      : props.node.children!.map((child, idx) =>
        <StyledNode node={child} styleFor={props.styleFor} key={idx}/>)
  }</span>;
}