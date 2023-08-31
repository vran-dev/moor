import { NodeSpec } from 'prosemirror-model'

export const CodeBlock = {
    group: 'block',
    content: 'text*',
    marks: '',
    code: true,
    defining: true,
    parseDOM: [
        {
            tag: 'pre',
            preserveWhitespace: 'full',
            getAttrs(dom: HTMLElement) {
                return {
                    lineWrap: dom.getAttribute('data-lineWrap') === 'false',
                    language: dom.getAttribute('data-language') || 'Plain',
                    layout: dom.getAttribute('data-layout') || 'SplitVertical',
                    data: dom.textContent
                }
            }
        }
    ],
    attrs: {
        lineWrap: { default: false },
        language: { default: 'Plain' },
        layout: { default: 'SplitVertical' },
        data: { default: '' }
    },
    toDOM() {
        return ['pre', ['code', 0]]
    }
} as NodeSpec
