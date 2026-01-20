import { CSSProperties, Fragment, Ref } from 'react';
import { ReadOnlyTextarea } from './ReadOnlyTextarea';
import { isEmpty } from 'remeda';
import { CSTNode } from '../parser/CSTNode';
import { DSLError } from '../parser';
import { disjointIntervals } from './disjointIntervals';
import { decorateIntervals } from './DecorateIntervals';

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
  const errorIntervals = disjointIntervals(errors);
  if (errorIntervals.length === 0) return <></>;
  return <ReadOnlyTextarea ref={ref} wrap={wrap} data-id="ErrorHighlighter" style={{color: 'transparent'}}>{
    decorateIntervals(errorIntervals, text, (text, error) =>
      <span key={`error-${error.start}`} style={squiggly} title={error.message}>{text}</span>,
    )}</ReadOnlyTextarea>;
}

function StyledNode(props: { node: CSTNode<string>, styleFor: SyntaxColorsProvider }) {
  const style = props.styleFor(props.node);
  return <span style={style}
               data-node={props.node.grammar.type}
               data-node-error={props.node.recoverableError}
               data-node-meta={props.node.grammar.meta ? JSON.stringify(props.node.grammar.meta) : undefined}
  >{
    isEmpty(props.node.children ?? [])
      ? props.node.text
      : props.node.children!.map((child, idx) =>
        <StyledNode node={child} styleFor={props.styleFor} key={idx}/>)
  }</span>;
}