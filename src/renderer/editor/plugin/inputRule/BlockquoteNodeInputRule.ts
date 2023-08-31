import { InputRule, wrappingInputRule } from 'prosemirror-inputrules'
import { MoorSchema } from '../../schema'

export const BlockquoteInputRule: InputRule = wrappingInputRule(
    /^\s*>\s$/,
    MoorSchema.nodes.blockquote
)
