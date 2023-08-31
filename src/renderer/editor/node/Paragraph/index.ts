import { NodeSpec } from 'prosemirror-model'

export const Paragraph = {
    content: 'inline*',
    group: 'block',
    parseDOM: [{ tag: 'p' }],
    toDOM() {
        return ['p', 0]
    }
} as NodeSpec
