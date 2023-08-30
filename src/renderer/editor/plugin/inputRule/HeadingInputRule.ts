import { InputRule, textblockTypeInputRule } from "prosemirror-inputrules";
import { schema } from "prosemirror-schema-basic";

export const HeadingNodeInputRule: InputRule = textblockTypeInputRule(
    new RegExp("^(#{1,6})\\s$"),
    schema.nodes.heading, 
    match => {
        return { level: match[1].length }
    }
)