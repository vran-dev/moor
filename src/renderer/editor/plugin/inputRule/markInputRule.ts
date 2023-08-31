import { InputRule } from 'prosemirror-inputrules'
import { AttributeSpec, MarkType } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'

export default function markInputRule(
    find: RegExp,
    type: MarkType,
    attrs?: {
        [name: string]: AttributeSpec
    }
): InputRule {
    return new InputRule(
        find,
        (
            state: EditorState,
            match: RegExpMatchArray,
            start: number,
            end: number
        ) => {
            const { tr } = state
            const captureGroup = match[match.length - 1]
            const fullMatch = match[0]
            if (captureGroup) {
                const startSpaces = fullMatch.search(/\S/)
                const textStart = start + fullMatch.indexOf(captureGroup)
                const textEnd = textStart + captureGroup.length
                if (textEnd < end) {
                    tr.delete(textEnd, end)
                    if (textStart > start) {
                        tr.delete(start + startSpaces, textStart)
                    }
                    const markEnd = start + startSpaces + captureGroup.length
                    tr.addMark(
                        start + startSpaces,
                        markEnd,
                        type.create(attrs || {})
                    )

                    return tr.removeStoredMark(type)
                }
            }
            return null
        }
    )
}
