import markInputRule from './markInputRule'
import { MoorSchema } from '../../schema'

export const ItalicStarMarkInputRule = markInputRule(
    /(?:^|\s)((?:\*)((?:[^*]+))(?:\*))$/,
    MoorSchema.marks.italic
)

export const ItalicUnderscoreMarkInputRule = markInputRule(
    /(?:^|\s)((?:_)((?:[^_]+))(?:_))$/,
    MoorSchema.marks.italic
)
