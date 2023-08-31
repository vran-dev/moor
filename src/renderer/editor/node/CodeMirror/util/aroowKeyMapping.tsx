import { Command, EditorView, KeyBinding } from '@codemirror/view'
import { exitCode } from 'prosemirror-commands'
import { Node } from 'prosemirror-model'
import { Selection, TextSelection } from 'prosemirror-state'
import { EditorView as PMEditorView } from 'prosemirror-view'

export const KeyBridgeMapping = (
    pmEditorView: PMEditorView,
    pmNode: Node,
    getPos: () => number
): KeyBinding[] => {
    return [
        {
            key: 'ArrowUp',
            run: arrowKeyHandle(pmEditorView, pmNode, getPos, 'line', -1),
            preventDefault: true,
            stopPropagation: true
        },
        {
            key: 'ArrowLeft',
            run: arrowKeyHandle(pmEditorView, pmNode, getPos, 'char', -1),
            preventDefault: true,
            stopPropagation: true
        },
        {
            key: 'ArrowDown',
            run: arrowKeyHandle(pmEditorView, pmNode, getPos, 'line', 1),
            preventDefault: true,
            stopPropagation: true
        },
        {
            key: 'ArrowRight',
            run: arrowKeyHandle(pmEditorView, pmNode, getPos, 'char', 1),
            preventDefault: true,
            stopPropagation: true
        },
        {
            key: 'Ctrl-Enter',
            run: () => {
                if (exitCode(pmEditorView.state, pmEditorView.dispatch)) {
                    pmEditorView.focus()
                    return true
                }
                return false
            }
        },
        {
            key: 'Backspace',
            run: (cm: EditorView) => {
                const ranges = cm.state.selection.ranges
                if (ranges.length > 1) {
                    return false
                }

                const selection = ranges[0]

                if (selection && (!selection.empty || selection.anchor > 0)) {
                    return false
                }

                // We don't want to convert a multi-line code block into a paragraph
                // because newline characters are invalid in a paragraph node.
                if (cm.state.doc.lines >= 2) {
                    return false
                }

                const state = pmEditorView.state
                const toggleNode = state.schema.nodes.paragraph
                const pos = getPos()
                const node = state.tr.doc.nodeAt(pos)
                if (node) {
                    const tr = state.tr.replaceWith(
                        pos,
                        pos + node.nodeSize,
                        toggleNode.createChecked({}, pmNode.content)
                    )
                    tr.setSelection(TextSelection.near(tr.doc.resolve(pos)))
                    pmEditorView.dispatch(tr)
                    pmEditorView.focus()
                    return true
                }
                return false
            }
        }
    ]
}

function arrowKeyHandle(
    pmEditorViw: PMEditorView,
    pmNode: Node,
    getPos: () => number,
    unit: 'line' | 'char',
    dir: 1 | -1
): Command {
    return (codeMirrorEditorView: EditorView) => {
        const { state } = codeMirrorEditorView
        // Exit if the selection is not empty
        if (state.selection.ranges.some((range) => !range.empty)) {
            return false
        }

        const anchor = state.selection.main.anchor
        const line = state.doc.lineAt(anchor)
        const lineOffset = anchor - line.from

        if (
            line.number !== (dir < 0 ? 1 : state.doc.lines) ||
            (unit === 'char' && lineOffset !== (dir < 0 ? 0 : line.length))
        ) {
            return false
        }

        const targetPos = getPos() + (dir < 0 ? 0 : pmNode.nodeSize)
        const selection = Selection.near(
            pmEditorViw.state.doc.resolve(targetPos),
            dir
        )
        pmEditorViw.dispatch(
            pmEditorViw.state.tr.setSelection(selection).scrollIntoView()
        )
        pmEditorViw.focus()
        return true
    }
}
