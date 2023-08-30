import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import { useLayoutEffect, useRef, useState } from "react"
import './index.css'
import React from "react"
import { plugins } from "./plugin"
import { MoorSchema } from "./node"
import { schema } from "prosemirror-schema-basic"

export function Editor(): JSX.Element {
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const [editorView, setEditorView] = useState<EditorView | null>(null)
  useLayoutEffect(() => {
    const state = EditorState.create({ schema, plugins: plugins })
    const view = new EditorView(editorContainerRef.current, { state: state })
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