import {GrammarNode} from "./types";

export function pathToString(v: GrammarNode<string>[]) {
  return v.map(it =>
    `${it.type}${it.meta?.regex?.toString() ?? ''}`
  ).join('/')
}