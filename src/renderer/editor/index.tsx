import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './index.css'
import React from 'react'
import { plugins } from './plugin'
import { MoorSchema } from './schema'
import { DOMParser as ProsemirrorDOMParser } from 'prosemirror-model'
import { ButtonNodeView } from './node/Button/ButtonNodeView'
import { ExcalidrawNodeView } from '@renderer/editor/node/Excalidraw/NodeView'
import { CodeMirrorNodeView } from './node/CodeMirror/NodeView'

function createNode(content: string) {
    return new DOMParser().parseFromString(content, 'text/html')
}

export function Editor(): JSX.Element {
    const editorContainerRef = useRef<HTMLDivElement>(null)
    const [editorView, setEditorView] = useState<EditorView | null>(null)
    const rootNode = ProsemirrorDOMParser.fromSchema(MoorSchema).parse(
        createNode(`
         <h3>Hello ProseMirror</h3>
       
         <p>This is editable text. You can focus it and start typing.</p>
         <p>Try using the “<strong>list</strong>” item in the menu to wrap this paragraph in
         a <em>numbered list</em>.</p>
         <h1> show button </h1>
         <h2> CodeMirror sample </h2>
         <pre>console.log('hello world')</pre>
         <h2> Excalidraw sample </h2>
         <div data-type="excalidraw" />
       `)
    )
    useEffect(() => {
        const state = EditorState.create({
            schema: MoorSchema,
            plugins: plugins,
            doc: rootNode
        })
        const view = new EditorView(editorContainerRef.current, {
            state: state,
            nodeViews: {
                excalidraw: (node, view, getPos) => {
                    return new ExcalidrawNodeView(node, view, getPos)
                },
                codeblock: (node, view, getPos) => {
                    return new CodeMirrorNodeView(node, view, getPos)
                }
            }
        })
        setEditorView(view)
        return () => {
            view.destroy()
        }
    }, [])
    return (
        <div
            ref={editorContainerRef}
            style={{
                width: '100%',
                height: '100%'
            }}
        ></div>
    )
}
