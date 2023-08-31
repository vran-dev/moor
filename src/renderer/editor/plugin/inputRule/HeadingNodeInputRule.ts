import { InputRule, textblockTypeInputRule } from 'prosemirror-inputrules'
import { MoorSchema } from '../../schema'

export const HeadingNodeInputRule: InputRule = textblockTypeInputRule(
    new RegExp('^(#{1,6})\\s$'),
    MoorSchema.nodes.heading,
    (match) => {
        return { level: match[1].length }
    }
)
