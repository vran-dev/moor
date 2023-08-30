import { inputRules } from "prosemirror-inputrules";
import { HeadingNodeInputRule } from "./HeadingInputRule";

export const MoorInputRules = inputRules({
    rules: [
        HeadingNodeInputRule
    ]
})