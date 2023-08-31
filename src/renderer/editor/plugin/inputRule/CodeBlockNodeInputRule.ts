import { MoorSchema } from '@renderer/editor/schema'
import { InputRule, textblockTypeInputRule } from 'prosemirror-inputrules'

export const markdownCodeBlockContentRegex = /^```$/

export const CodeBlockNodeInputRule: InputRule = textblockTypeInputRule(
    markdownCodeBlockContentRegex,
    MoorSchema.nodes.codeblock,
    (match) => {
        return {
            language: 'Plain',
            data: ''
        }
    }
)
