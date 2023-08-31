import { NodeSpec } from 'prosemirror-model'

export const ButtonNode = {
    group: 'block',
    defining: true,
    parseDOM: [{ tag: 'button' }],
    toDOM() {
        return ['button', 0]
    }
} as NodeSpec
