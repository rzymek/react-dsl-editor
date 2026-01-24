import {pattern} from "../core";

export const newline = pattern(/\n+|$/);
newline.type='newline' as never;
