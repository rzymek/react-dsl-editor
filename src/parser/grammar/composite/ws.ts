import { pattern } from '../core/pattern';
import {optional} from "./optional";

export const ws = optional(pattern(/\s+/))
