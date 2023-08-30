import { baseKeymap } from "prosemirror-commands";
import { dropCursor } from "prosemirror-dropcursor";
import { history } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { MoorInputRules } from "./inputRule";

export const plugins = [
    dropCursor(),
    history(),
    keymap(baseKeymap),
    MoorInputRules,
]