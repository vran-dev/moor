import { inputRules } from 'prosemirror-inputrules'
import { HeadingNodeInputRule } from './HeadingNodeInputRule'
import { BlockquoteInputRule } from './BlockquoteNodeInputRule'
import {
    BoldStarMarkInputRule,
    BoldUnderscoreMarkInputRule
} from './BoldMarkInputRule'
import { ItalicStarMarkInputRule, ItalicUnderscoreMarkInputRule } from './ItalicMarkInputRule'
import { CodeBlockNodeInputRule } from './CodeBlockNodeInputRule'

export const MoorInputRules = inputRules({
    rules: [
        HeadingNodeInputRule,
        BlockquoteInputRule,
        BoldStarMarkInputRule,
        BoldUnderscoreMarkInputRule,
        ItalicStarMarkInputRule,
        ItalicUnderscoreMarkInputRule,
        CodeBlockNodeInputRule
    ]
})
