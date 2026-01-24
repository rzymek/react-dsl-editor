import {map, mapKeys, pipe, reduce} from "remeda";
import {GrammarNode} from "./types";

export function serialize(g: GrammarNode<string>): object {
  const key = g.meta?.regex ? g.meta?.regex.toString() : g.type;
  return {
    [key]:
      pipe(g.children,
        map(serialize),
        reduce((acc, it, idx) => ({
          ...acc,
          ...mapKeys(it, key => `${idx.toString().padStart(2, '0')}_${key}`)
        }), {})
      )
  }
}