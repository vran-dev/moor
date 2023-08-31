import { Attrs, Node } from 'prosemirror-model'
import { EditorView } from 'prosemirror-view'

export function updateNodeAttributes(
    editorView: EditorView,
    getPos: () => number,
    attrs: Attrs
): void {
    const tr = editorView.state.tr
    tr.setNodeMarkup(getPos(), undefined, attrs)
    editorView.dispatch(tr)
}

export function updateNodeAttributesPartial(
    editorView: EditorView,
    getPos: () => number,
    attrs: Partial<Attrs>
): void {
    const tr = editorView.state.tr
    tr.setNodeMarkup(getPos(), undefined, {
        ...editorView.state.doc.nodeAt(getPos())?.attrs,
        ...attrs
    })
    editorView.dispatch(tr)
}
