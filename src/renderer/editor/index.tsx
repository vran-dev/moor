import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {Schema} from "prosemirror-model"
import {schema} from "prosemirror-schema-basic"
import {addListNodes} from "prosemirror-schema-list"
import { useLayoutEffect, useRef, useState } from "react"
import {keymap} from "prosemirror-keymap"
import {history} from "prosemirror-history"
import {baseKeymap} from "prosemirror-commands"
import {dropCursor} from "prosemirror-dropcursor"

export function Editor(): JSX.Element {
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const [editorView, setEditorView] = useState<EditorView | null>(null)
  useLayoutEffect(() => {
    const mySchema = new Schema({
      nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
      marks: schema.spec.marks
    })
    const plugins = [
      keymap(baseKeymap),
      dropCursor(),
      history()
    ]
    const state = EditorState.create({ schema: mySchema, plugins: plugins })
    const view = new EditorView(editorContainerRef.current, { state })
    setEditorView(view)
  }, [])
  return (
    <div ref={editorContainerRef} style={{
      width: "100%",
      height: "100%",
    }}>
    </div>
  );
}