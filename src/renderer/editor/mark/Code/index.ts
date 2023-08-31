import { MarkSpec } from 'prosemirror-model'

export const Code = {
    parseDOM: [{ tag: 'code' }],
    toDOM() {
        return ['code', 0]
    }
} as MarkSpec
