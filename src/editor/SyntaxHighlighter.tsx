import {CSSProperties, Ref} from 'react';
import {ReadOnlyTextarea} from './ReadOnlyTextarea';
import {isEmpty} from 'remeda';
import {CSTNode} from '../parser/CSTNode';

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

function StyledNode(props: { node: CSTNode<string>, styleFor: SyntaxColorsProvider }) {
  const style = props.styleFor(props.node);
  if (isEmpty(props.node.children ?? []) && isEmpty(props.node.text)) {
    return null;
  }
  return <span style={style}
               data-node={props.node.grammar.type}
               data-node-meta={props.node.grammar.meta ? JSON.stringify(props.node.grammar.meta, function (_, value) {
                 if (value instanceof RegExp) {
                   return value.toString()
                 }
                 return value;
               }) : undefined}
  >{
    isEmpty(props.node.children ?? [])
      ? props.node.text
      : props.node.children!.map((child, idx) =>
        <StyledNode node={child} styleFor={props.styleFor} key={idx}/>)
  }</span>;
}