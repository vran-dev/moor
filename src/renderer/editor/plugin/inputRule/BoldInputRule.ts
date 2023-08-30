import { InputRule } from "prosemirror-inputrules";
import { EditorState } from "prosemirror-state";

export const BoldingInputRule: InputRule = new InputRule(
    /(?:\*\*|__)([^*_]+)(?:\*\*|__)$/,
    (state: EditorState,
        match: RegExpMatchArray,
        start: number,
        end: number) => {
        const tr = state.tr.delete(start, end);
        return tr.insertText(match[1], start, end);
    }
)