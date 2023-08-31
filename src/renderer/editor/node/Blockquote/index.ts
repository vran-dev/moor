import { NodeSpec } from 'prosemirror-model'

export const BlockQuote = {
    content: 'block+',
    group: 'block',
    defining: true,
    parseDOM: [{ tag: 'blockquote' }],
    toDOM() {
        return ['blockquote', 0]
    }
} as NodeSpec
