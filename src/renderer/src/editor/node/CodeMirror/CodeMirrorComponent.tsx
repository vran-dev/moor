import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  defaultKeymap,
  history,
  indentWithTab,
  selectAll as cmSelectAll,
  historyKeymap
} from '@codemirror/commands'
import {
  bracketMatching,
  defaultHighlightStyle,
  foldGutter,
  indentOnInput,
  syntaxHighlighting
} from '@codemirror/language'
import {
  Compartment,
  EditorState as CodeMirrorEditorState,
  Extension as CodeMirrorExtension,
  Transaction as CodeMirrorTransaction,
  EditorSelection
} from '@codemirror/state'
import {
  Command as CodeMirrorCommand,
  EditorView as CodeMirrorEditorView,
  KeyBinding as CodeMirrorKeyBinding,
  ViewUpdate,
  keymap,
  lineNumbers
} from '@codemirror/view'
import { autocompletion, closeBrackets } from '@codemirror/autocomplete'
import { githubLightInit } from '@uiw/codemirror-theme-github'
import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_DOWN_COMMAND,
  KEY_ENTER_COMMAND,
  NodeKey,
  $isNodeSelection,
  $isDecoratorNode,
  $getNearestNodeFromDOMNode
} from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import { $isCodeMirrorNode, CodeblockLayout } from '.'
import './index.css'
import { LanguageInfo, languageInfos, languageMatch, listLanguages } from './languages'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { VirtualSelect } from '@renderer/ui/Select'
import { CopyButton } from './components/CopyButton'
import { CodeblockPreview } from './components/CodeblockPreview'
import { LayoutSelect } from './components/LayoutSelect'
import { useDebounce } from '@renderer/editor/utils/useDebounce'
import { codeMirrorArrowKeyDelegate } from './utils/codeMirrorArrowKeyDelegate'
import { useCover } from '@renderer/ui/Cover/useCover'
import { codeMirrorNodeListener } from './utils/codeMirrorNodeListener'
export interface LanguageOption extends LanguageInfo {
  value: string
  label: string
}

export function CodeMirrorComponent(props: {
  nodeKey: NodeKey
  data: string
  layout?: CodeblockLayout
  language?: string | null
}): JSX.Element {
  const [codeMirror, setCodeMirror] = useState<CodeMirrorEditorView | null>()
  const editorRef = useRef<HTMLDivElement>(null)
  const { data, nodeKey, language } = props
  const [editor] = useLexicalComposerContext()
  const [selectLanguage, setSelectLanguage] = useState<LanguageOption | null>(null)
  const [layout, setLayout] = useState<CodeblockLayout>(
    props.layout ? props.layout : CodeblockLayout.SplitVertical
  )
  const [selected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)
  useEffect((): void => {
    if (language) {
      const matchedLanges = listLanguages({ query: language, nameFullMatch: true })
      if (matchedLanges.length > 0) {
        const option = {
          label: matchedLanges[0].name,
          value: matchedLanges[0].name,
          ...matchedLanges[0]
        }
        setSelectLanguage(option)
      }
    }
  }, [language])
  const languageCompartment = useMemo(() => new Compartment(), [])
  const languageOptions = useMemo(() => {
    return languageInfos.map((item, index) => {
      return {
        value: item.name,
        label: item.name,
        ...item
      }
    })
  }, [])

  useEffect(() => {
    if (!languageCompartment || !codeMirror) {
      return
    }
    const langInfo = selectLanguage
    const updateLanguage = (languageSupport: CodeMirrorExtension): void => {
      codeMirror?.dispatch({
        effects: languageCompartment.reconfigure(languageSupport)
      })
    }

    if (langInfo?.codeMirrorLanguage) {
      if (langInfo.codeMirrorLanguage.support) {
        updateLanguage(langInfo?.codeMirrorLanguage?.support)
      } else {
        langInfo.codeMirrorLanguage.load().then((language) => {
          updateLanguage(language)
        })
      }
    } else {
      updateLanguage([])
    }
  }, [selectLanguage, codeMirror, languageCompartment])

  const onLanguageChange = useCallback((option) => {
    setSelectLanguage(option)
    updateLexicalNodeLanguage(option.value)
  }, [])

  // update lexical node data
  const updateLexicalNodeData = useDebounce(
    useCallback(
      (latest: string) =>
        editor.update(() => {
          const node = $getNodeByKey(nodeKey)
          if ($isCodeMirrorNode(node)) {
            node.setData(latest)
          }
        }),
      [editor, nodeKey]
    ),
    50,
    1000
  )

  const updateLexicalNodeLanguage = useCallback(
    (language: string) =>
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isCodeMirrorNode(node)) {
          node.setLanguage(language)
        }
      }),
    [editor, nodeKey]
  )

  const updateLexicalNodeLayout = useCallback(
    (layout: CodeblockLayout) =>
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isCodeMirrorNode(node)) {
          node.setLayout(layout)
        }
      }),
    [editor, nodeKey]
  )

  // support jump from codemirror to lexical and delegate select_all to codemirror
  useEffect(() => {
    if (!codeMirror) {
      return
    }
    return codeMirrorNodeListener(editor, nodeKey, layout, codeMirror)
  }, [codeMirror, layout, editor, nodeKey])

  const [cover, showCover, hideCover] = useCover()

  useLayoutEffect(() => {
    if (!codeMirror) {
      return
    }
    if (layout === CodeblockLayout.Preview) {
      if (selected) {
        showCover()
      } else {
        hideCover()
      }
      return
    }
    if (selected && !codeMirror.hasFocus) {
      editor.blur()
      // use setTimeout to avoid codemirror focus failed
      setTimeout(() => {
        codeMirror?.focus()
        codeMirror?.dispatch({
          selection: EditorSelection.cursor(codeMirror.state.doc.length)
        })
      })
    }
  }, [codeMirror, selected, editor, layout])

  // initialize codemirror, support jump from codemirror to lexical
  useEffect(() => {
    if (!editorRef.current) {
      return
    }
    const codeMirrorKeymap = (): CodeMirrorKeyBinding[] => {
      return [
        {
          key: 'ArrowUp',
          run: codeMirrorArrowKeyDelegate(editor, nodeKey, 'line', -1),
          preventDefault: true,
          stopPropagation: true
        },
        {
          key: 'ArrowLeft',
          run: codeMirrorArrowKeyDelegate(editor, nodeKey, 'char', -1),
          preventDefault: true,
          stopPropagation: true
        },
        {
          key: 'ArrowDown',
          run: codeMirrorArrowKeyDelegate(editor, nodeKey, 'line', 1),
          preventDefault: true,
          stopPropagation: true
        },
        {
          key: 'ArrowRight',
          run: codeMirrorArrowKeyDelegate(editor, nodeKey, 'char', 1),
          preventDefault: true,
          stopPropagation: true
        },
        {
          key: 'Backspace',
          run: (cm: CodeMirrorEditorView): boolean => {
            const ranges = cm.state.selection.ranges
            if (ranges.length > 1) {
              return false
            }
            const selection = ranges[0]
            if (selection && (!selection.empty || selection.anchor > 0)) {
              return false
            }

            // // We don't want to convert a multi-line code block into a paragraph
            // // because newline characters are invalid in a paragraph node.
            if (cm.state.doc.lines >= 2) {
              return false
            }

            editor.update(() => {
              const node = $getNodeByKey(nodeKey)!
              const nextSibling = node.getNextSibling()
              if (nextSibling) {
                codeMirror?.contentDOM.blur()
                node.selectPrevious()
              }
              node.remove()
              return true
            })
            return true
          },
          preventDefault: true,
          stopPropagation: true
        }
      ]
    }
    const changeFilter = CodeMirrorEditorView.updateListener.of((update: ViewUpdate) => {
      if (update.docChanged) {
        const { doc } = update.view.state.toJSON() || {}
        updateLexicalNodeData(doc || '')
      }
    })
    const codeMirror = new CodeMirrorEditorView({
      doc: data,
      extensions: [
        keymap.of([indentWithTab, ...historyKeymap, ...defaultKeymap, ...codeMirrorKeymap()]),
        history(),
        indentOnInput(),
        autocompletion(),
        CodeMirrorEditorView.lineWrapping,
        foldGutter(),
        // highlightActiveLine(),
        // drawSelection(),
        lineNumbers(),
        closeBrackets(),
        bracketMatching(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        githubLightInit({
          settings: {
            background: 'transpanret',
            gutterBackground: 'transparent',
            selection: 'default'
          }
        }),
        languageCompartment.of([]),
        changeFilter
      ]
    })
    setCodeMirror(codeMirror)
    return () => {
      codeMirror.destroy()
    }
  }, [])

  // append codemirror to root dom
  useEffect(() => {
    if (codeMirror && editorRef) {
      editorRef.current?.appendChild(codeMirror.dom)
    }
    return () => {
      if (codeMirror && editorRef) {
        if (editorRef.current?.contains(codeMirror.dom)) {
          editorRef.current?.removeChild(codeMirror.dom)
        }
      }
    }
  }, [codeMirror, layout])

  useEffect(() => {
    if (!codeMirror) {
      return
    }
    const newText = data || ''
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
      codeMirror.dispatch({
        changes: {
          from: start,
          to: curEnd,
          insert: newText.slice(start, newEnd)
        }
      })
    }
  }, [codeMirror, data])

  const onLayoutChange = useCallback(
    (value) => {
      setLayout(CodeblockLayout[value])
      updateLexicalNodeLayout(value)
    },
    [layout]
  )

  const shouldShowCodeData = useCallback(() => {
    if (layout !== CodeblockLayout.Preview) {
      return true
    }
    if (selectLanguage === null) {
      return true
    }
    return !selectLanguage.preview
  }, [layout, selectLanguage])

  const shouldShowCodePreview = useCallback(() => {
    if (layout === CodeblockLayout.Code) {
      return false
    }
    if (selectLanguage === null || !selectLanguage.preview) {
      return false
    }
    return true
  }, [layout, selectLanguage])

  // const onMouseClick = (event: MouseEvent): void => {
  //   const { codeDOMNode, isOutside } = getMouseInfo(event)
  //   if (isOutside) {
  //     return
  //   }
  //   if (!codeDOMNode) {
  //     return
  //   }
  //   editor.update(() => {
  //     const maybeCodeNode = $getNearestNodeFromDOMNode(codeDOMNode)
  //     if ($isCodeMirrorNode(maybeCodeNode) && maybeCodeNode.getKey() === props.nodeKey) {
  //       setSelected(true)
  //     }
  //   })
  // }
  // useEffect(() => {
  //   document.addEventListener('mousedown', onMouseClick)
  //   return () => {
  //     document.removeEventListener('mousedown', onMouseClick)
  //   }
  // }, [])

  return (
    <div className="codeblock-container" draggable={true}>
      <div className="codeblock-header">
        <VirtualSelect
          options={languageOptions}
          onSelect={(option): void => onLanguageChange(option)}
          defaultIndex={languageOptions.findIndex((item) => item.value === language)}
          filter={(inputValue, option): boolean => languageMatch(inputValue, false, option)}
          mainMinWidth="200px"
        />
        {selectLanguage && selectLanguage.preview && (
          <LayoutSelect onChange={(option): void => onLayoutChange(option.value)} layout={layout} />
        )}

        {codeMirror && <CopyButton codeMirror={codeMirror} />}
      </div>
      <div className="codeblock-main">
        {
          <div
            className="codeblock-editor"
            ref={editorRef}
            style={{
              display: shouldShowCodeData() ? 'block' : 'none'
            }}
          ></div>
        }
        {shouldShowCodePreview() && <CodeblockPreview language={selectLanguage} data={data} />}
      </div>
      {cover}
    </div>
  )
}

function getMouseInfo(event: MouseEvent): {
  codeDOMNode: HTMLElement | null
  isOutside: boolean
} {
  const target = event.target
  if (target && target instanceof HTMLElement) {
    const codeDOMNode = target.closest<HTMLElement>('div.codeblock-container')
    const isOutside = !(codeDOMNode || target.closest<HTMLElement>('div.codeblock-header'))
    return { codeDOMNode, isOutside }
  } else {
    return { codeDOMNode: null, isOutside: true }
  }
}
