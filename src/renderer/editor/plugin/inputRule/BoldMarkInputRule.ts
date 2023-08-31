import markInputRule from './markInputRule'
import { MoorSchema } from '../../schema'

export const BoldStarMarkInputRule = markInputRule(
    /(?:^|\s)((?:\*\*)((?:[^*]+))(?:\*\*))$/,
    MoorSchema.marks.bold
)

export const BoldUnderscoreMarkInputRule = markInputRule(
    /(?:^|\s)((?:__)((?:[^__]+))(?:__))$/,
    MoorSchema.marks.bold
)
