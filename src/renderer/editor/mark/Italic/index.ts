import { MarkSpec } from 'prosemirror-model'

export const Italic = {
    parseDOM: [
        { tag: 'i' },
        { tag: 'em' },
        { style: 'font-style=italic' },
        { style: 'font-style=normal', clearMark: (m) => m.type.name == 'em' }
    ],
    toDOM() {
        return ['em', 0]
    }
} as MarkSpec
