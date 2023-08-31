import { NodeSpec } from 'prosemirror-model'

export const Horizontal = {
    group: 'block',
    parseDOM: [{ tag: 'hr' }],
    toDOM() {
        return ['hr']
    }
} as NodeSpec
