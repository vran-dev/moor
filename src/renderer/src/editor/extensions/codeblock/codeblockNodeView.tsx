import { NodeViewRendererProps, NodeViewWrapper, ReactNodeViewRendererOptions } from '@tiptap/react'
import { Node } from '@tiptap/pm/model'
import { EditorView, NodeView, Decoration, DecorationSource, DecorationSet } from '@tiptap/pm/view'
import { TextSelection, Selection, EditorState, NodeSelection } from '@tiptap/pm/state'
import { exitCode } from 'prosemirror-commands'
import { undo, redo } from 'prosemirror-history'
import {
  EditorView as CodeMirror,
  KeyBinding,
  keymap as cmKeymap,
  highlightActiveLine,
  keymap,
  lineNumbers
} from '@codemirror/view'
import {
  defaultKeymap,
  history,
  indentWithTab,
  selectAll as cmSelectAll
} from '@codemirror/commands'
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  LanguageSupport,
  bracketMatching,
  indentOnInput,
  foldGutter
} from '@codemirror/language'
import { ViewUpdate, Decoration as CmDecoration } from '@codemirror/view'
import { autocompletion, closeBrackets } from '@codemirror/autocomplete'
import { Compartment } from '@codemirror/state'
import ProsemirrorNodes from '@renderer/editor/common/prosemirrorNodes'
import { LanguageBlock, languageBlocks } from './suggestLanguages'
import { v4 as uuid } from 'uuid'
import { selectAll } from 'prosemirror-commands'
import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { mermaidHighlightStyle } from '@renderer/editor/codeMirror/language/mermaid'
import { githubLightInit } from '@uiw/codemirror-theme-github'
import { SourceTextModule } from 'vm'

const codeMirrorKeymap = (props: NodeViewRendererProps): KeyBinding[] => {
  const view = props.editor.view
  return [
    { key: 'ArrowUp', run: (cm: CodeMirror) => maybeEscape(cm, props, 'line', -1) },
    { key: 'ArrowLeft', run: (cm: CodeMirror) => maybeEscape(cm, props, 'char', -1) },
    { key: 'ArrowDown', run: (cm: CodeMirror) => maybeEscape(cm, props, 'line', 1) },
    { key: 'ArrowRight', run: (cm: CodeMirror) => maybeEscape(cm, props, 'char', 1) },
    {
      key: 'Ctrl-Enter',
      run: (): boolean => {
        if (!exitCode(view.state, view.dispatch)) return false
        view.focus()
        return true
      }
    },
    {
      key: 'Ctrl-z',
      mac: 'Cmd-z',
      run: () => undo(view.state, view.dispatch)
    },
    {
      key: 'Shift-Ctrl-z',
      mac: 'Shift-Cmd-z',
      run: () => redo(view.state, view.dispatch)
    },
    {
      key: 'Ctrl-y',
      mac: 'Cmd-y',
      run: () => redo(view.state, view.dispatch)
    },
    {
      key: 'Mod-a',
      run: (cm: CodeMirror): boolean => {
        const ranges = cm.state.selection.ranges
        if (ranges.length > 1 || !ranges[0]) {
          return false
        }
        const selection = ranges[0]
        const { anchor, head } = selection
        if (anchor === 0 && head === cm.state.doc.length) {
          view.focus()
          selectAll(view.state, view.dispatch, view)
        } else {
          // first select all codeblock area
          cmSelectAll(cm)
        }
        return true
      }
    },
    {
      key: 'Ctrl-f',
      mac: 'Cmd-f',
      run: (cm: CodeMirror): boolean => {
        const ranges = cm.state.selection.ranges
        if (ranges.length > 1) {
          props.editor?.commands.showSearchPageBox()
          return false
        }
        const selection = ranges[0]
        if (!selection) {
          props.editor?.commands.showSearchPageBox()
          return true
        }
        const searchString = cm.state.doc.sliceString(selection.from, selection.to)
        props.editor?.commands.showSearchPageBox(searchString)
        if (searchString) {
          props.editor?.commands.search(searchString)
        }
        return true
      }
    },
    {
      key: 'Escape',
      mac: 'Escape',
      run: (): boolean => {
        props.editor?.commands.hideSearchPageBox()
        props.editor?.commands.search()
        return true
      }
    },
    {
      key: 'Backspace',
      run: (cm: CodeMirror): boolean => {
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

        const state = view.state
        // const toggleNode = assertGet(state.schema.nodes, this.toggleName)
        // const toggleNode = state.schema.nodes[this.toggleName]
        const { getPos, node } = props
        const pos = getPos()
        const posNode = state.tr.doc.nodeAt(pos)
        const tr = posNode
          ? state.tr.replaceWith(
              pos,
              pos + posNode.nodeSize,
              view.state.schema.nodes.paragraph.createChecked({}, node.content)
            )
          : state.tr
        tr.setSelection(TextSelection.near(tr.doc.resolve(pos)))
        view.dispatch(tr)
        view.focus()
        return true
      }
    }
  ]
}

const maybeEscape = (cm: CodeMirror, props: NodeViewRendererProps, unit, dir): boolean => {
  const { state } = cm
  let { main } = state.selection
  if (!main.empty) {
    return false
  }
  if (unit == 'line') {
    main = state.doc.lineAt(main.head)
  }
  if (dir < 0 ? main.from > 0 : main.to < state.doc.length) {
    return false
  }
  const { getPos, editor } = props
  const view = editor.view
  const node = view.state.doc.nodeAt(getPos())
  const targetPos = getPos() + (dir < 0 ? 0 : node.nodeSize + 1)
  if (targetPos < 0 || targetPos > view.state.doc.content.size) {
    return false
  }
  const selection = Selection.near(view.state.doc.resolve(targetPos), dir)
  console.log(targetPos, selection)

  if (selection instanceof NodeSelection) {
    const nodeSelection = selection as NodeSelection
    if (nodeSelection.node.type.name === 'codeBlock' && dir === -1) {
      // const sel = TextSelection.create(view.state.doc, targetPos + node?.nodeSize)
      // console.log(sel)
      // const tr = view.state.tr.setSelection(sel).scrollIntoView()
      // view.dispatch(tr)
      // view.focus()
      // return true
    }
  }
  const tr = view.state.tr.setSelection(selection).scrollIntoView()
  view.dispatch(tr)
  view.focus()
  return true
}

export const CodeBlockNodeView = forwardRef((props: NodeViewRendererProps, ref): JSX.Element => {
  const [languageBlock, setLanguageBlock] = useState<LanguageBlock | null>(null)
  const [id, setId] = useState('id_' + uuid())
  const [langOptions, setLangOptions] = useState([])
  const [codeMirror, setCodeMirror] = useState<CodeMirror | null>(null)
  const isUpdating = useRef(false)
  const codeblockWrapperRef = useRef<HTMLDivElement>(null)
  const languageCompartment = new Compartment()
  console.log('update', props, props.getPos())

  const forwardUpdate = (props: NodeViewRendererProps, update: ViewUpdate): void => {
    const cm = update.view
    if (!cm.hasFocus) {
      return
    }
    const { getPos, editor } = props
    const view = editor.view
    let offset = getPos() + 1
    const cmSelection = update.state.selection.main
    const selFrom = offset + cmSelection.from
    const selTo = offset + cmSelection.to
    const pmSel = view.state.selection
    if (update.docChanged || pmSel.from != selFrom || pmSel.to != selTo) {
      const tr = view.state.tr
      if (update.changes.empty) {
        return
      }
      update.changes.iterChanges((fromA, toA, fromB, toB, text) => {
        if (text.length) {
          const schema = view.state.schema
          tr.replaceWith(offset + fromA, offset + toA, schema.text(text.toString()))
        } else {
          tr.delete(offset + fromA, offset + toA)
        }
        offset += toB - fromB - (toA - fromA)
      })
      tr.setSelection(TextSelection.create(tr.doc, selFrom, selTo))
      view.dispatch(tr)
    }
  }

  const matchLanguage = (
    lang: string | null | undefined,
    matched: (LanguageSupport: LanguageSupport) => void,
    noMatch?: (lang: string) => void
  ): void => {
    if (!lang) {
      return
    }
    const block = languageBlocks.find((block) => block.name.toLowerCase() === lang.toLowerCase())
    if (!block) {
      noMatch && noMatch(lang)
      return
    }

    if (block.lang) {
      if (block.lang.support) {
        matched(block.lang.support)
      } else {
        block.lang.load().then((support: LanguageSupport) => {
          matched(support)
        })
      }
    }
    setLanguageBlock(block)
  }

  useEffect(() => {
    const codeMirror = new CodeMirror({
      doc: props.node.textContent,
      extensions: [
        cmKeymap.of([indentWithTab, ...codeMirrorKeymap(props), ...defaultKeymap]),
        indentOnInput(),
        autocompletion(),
        CodeMirror.lineWrapping,
        foldGutter(),
        lineNumbers(),
        // highlightActiveLine(),
        // drawSelection(),
        history(),
        closeBrackets(),
        bracketMatching(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        syntaxHighlighting(mermaidHighlightStyle, { fallback: false }),
        githubLightInit({
          settings: {
            background: 'transpanret',
            gutterBackground: 'transparent',
            selection: 'default'
          }
        }),
        languageCompartment.of([]),
        CodeMirror.updateListener.of((update: ViewUpdate) => forwardUpdate(props, update))
      ]
    })
    codeblockWrapperRef.current?.appendChild(codeMirror.dom)
    codeMirror.focus()
    const languages = languageBlocks
      .map((block) => {
        return {
          value: block.name,
          text: block.name
        }
      })
      .sort((a, b) => a.value.localeCompare(b.value))
    setLangOptions(languages)
    setCodeMirror(codeMirror)
    return () => {
      codeMirror.destroy()
    }
  }, [])

  useEffect(() => {
    if (!codeMirror) {
      return
    }
    console.log('update codemirror')
    codeMirror.focus()
    matchLanguage(
      props.node.attrs.language,
      (support) => {
        codeMirror.dispatch({
          effects: languageCompartment.reconfigure(support)
        })
      },
      (lang) => console.debug(lang + ' not found')
    )
  }, [codeMirror])

  // useEffect(() => {
  //   if (!codeMirror) {
  //     return
  //   }
  //   if (props.selected) {
  //     console.log('selected...')
  //     codeMirror.focus()
  //   }
  // }, [props.selected, codeMirror])

  if (props.selected) {
    console.log('selected...')
    // codeMirror?.focus()
  }
  if (props.setSelection) {
    isUpdating.current = true
    console.log('set selection')
    // codeMirror?.focus()
    codeMirror?.dispatch({ selection: props.setSelection })
    isUpdating.current = false
  }

  // useEffect(() => {
  //   if (props.setSelection) {
  //     isUpdating.current = true
  //     console.log('set selection')
  //     codeMirror?.focus()
  //     codeMirror?.dispatch({ selection: props.setSelection })
  //     isUpdating.current = false
  //   }
  // }, [props.setSelection, codeMirror])

  useEffect(() => {
    if (!codeMirror) {
      return
    }
    if (isUpdating.current) {
      return
    }
    const { node } = props
    const newText = node.textContent
    const curText = codeMirror.state.doc.toString()
    if (newText != curText) {
      let start = 0,
        curEnd = curText.length,
        newEnd = newText.length
      while (start < curEnd && curText.charCodeAt(start) == newText.charCodeAt(start)) {
        ++start
      }
      while (
        curEnd > start &&
        newEnd > start &&
        curText.charCodeAt(curEnd - 1) == newText.charCodeAt(newEnd - 1)
      ) {
        curEnd--
        newEnd--
      }
      isUpdating.current = true
      codeMirror.dispatch({
        changes: {
          from: start,
          to: curEnd,
          insert: newText.slice(start, newEnd)
        }
      })
      isUpdating.current = false
    }
    if (languageBlock?.updateLivePreview) {
      languageBlock.updateLivePreview(id, codeblockWrapperRef.current, props.node.textContent)
    }
  }, [props.node.textContent])

  useEffect(() => {
    if (languageBlock?.lang) {
      if (languageBlock.lang.support) {
        codeMirror?.dispatch({
          effects: languageCompartment.reconfigure(languageBlock.lang.support)
        })
      } else {
        languageBlock?.lang.load().then((support: LanguageSupport) => {
          codeMirror?.dispatch({
            effects: languageCompartment.reconfigure(support)
          })
        })
      }
    }
    if (languageBlock?.updateLivePreview) {
      languageBlock.updateLivePreview(id, codeblockWrapperRef.current, props.node.textContent)
    }
  }, [languageBlock])

  const onLanguageSelect = (event): void => {
    event.preventDefault()
    const lang = event.target?.value
    matchLanguage(
      lang,
      (support) => {
        codeMirror?.dispatch({
          effects: languageCompartment.reconfigure(support)
        })
      },
      () => {
        codeMirror?.dispatch({
          effects: languageCompartment.reconfigure([])
        })
        ProsemirrorNodes.updateNodeAttributes(props.editor.view, props.getPos, {
          language: 'Plain'
        })
      }
    )
  }

  return (
    <>
      <NodeViewWrapper className="relative">
        <div className="drag-handle" contentEditable="false" draggable="true" data-drag-handle />
        <div className={'codeblock'} ref={codeblockWrapperRef}>
          <select onChange={onLanguageSelect} value={languageBlock?.name}>
            {langOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
      </NodeViewWrapper>
    </>
  )
})
CodeBlockNodeView.displayName = 'CodeBlockNodeView'
