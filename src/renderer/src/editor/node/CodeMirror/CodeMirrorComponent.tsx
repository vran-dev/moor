import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  Transaction as CodeMirrorTransaction
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
import { LanguageInfo, languageInfos, languageMatch, listLanguages } from './CodeMirrorLanguages'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { VirtualSelect } from '@renderer/ui/Select'
import { CopyButton } from './components/CopyButton'
import { CodeblockPreview } from './components/CodeblockPreview'
import { LayoutSelect } from './components/LayoutSelect'
import { useDebounce } from '@renderer/editor/utils/useDebounce'

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

  // support jump from lexical to codemirror
  useEffect(() => {
    return mergeRegister(
      editor.registerCommand<KeyboardEvent>(
        KEY_ARROW_DOWN_COMMAND,
        (event, targetEditor) => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            const topEle = selection.anchor.getNode().getTopLevelElement()
            if (topEle && topEle.getNextSibling() && $isCodeMirrorNode(topEle.getNextSibling())) {
              return true
            }
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ARROW_UP_COMMAND,
        (event, targetEditor) => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            const topEle = selection.anchor.getNode().getTopLevelElement()
            if (
              topEle &&
              topEle.getPreviousSibling() &&
              $isCodeMirrorNode(topEle.getPreviousSibling())
            ) {
              return true
            }
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_ENTER_COMMAND,
        (event, targetEditor) => {
          if (codeMirror) {
            return codeMirror.hasFocus
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<KeyboardEvent>(
        KEY_DOWN_COMMAND,
        (event, targetEditor): boolean => {
          if (event.key === 'Enter') {
            if (event.ctrlKey) {
              if (codeMirror && codeMirror.hasFocus) {
                const { state } = codeMirror
                if (state.selection.ranges.some((range) => !range.empty)) {
                  return false
                }
                event.preventDefault()
                event.stopImmediatePropagation()
                const anchor = state.selection.main.anchor
                const line = state.doc.lineAt(anchor)
                if (line.number === state.doc.lines) {
                  editor.update(() => {
                    const node = $getNodeByKey(nodeKey)!
                    const nextSibling = node.getNextSibling()
                    if (!$isDecoratorNode(nextSibling) && nextSibling) {
                      codeMirror?.contentDOM.blur()
                      node.selectNext()
                    } else {
                      const pNode = $createParagraphNode()
                      node.insertAfter(pNode)
                      codeMirror.contentDOM.blur()
                      pNode.select()
                    }
                  })
                  return true
                }
              }
            }
          }
          if (codeMirror && codeMirror.hasFocus) {
            // console.log('on key down', event, codeMirror.hasFocus)
            return codeMirror.hasFocus
          }
          return false
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [editor, codeMirror])

  // initialize codemirror, support jump from codemirror to lexical
  useEffect(() => {
    if (!editorRef.current) {
      return
    }

    const maybeEscape = (unit: 'line' | 'char', dir: 1 | -1): CodeMirrorCommand => {
      return (view: CodeMirrorEditorView) => {
        const { state } = view

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
        editor.update(() => {
          const node = $getNodeByKey(nodeKey)!
          if (dir < 0) {
            const previousSibling = node.getPreviousSibling()
            if (previousSibling) {
              codeMirror?.contentDOM.blur()
              node.selectPrevious()
            } else {
              node.insertBefore($createParagraphNode())
            }
          } else {
            const nextSibling = node.getNextSibling()
            if (nextSibling) {
              codeMirror?.contentDOM.blur()
              node.selectNext()
            } else {
              node.insertAfter($createParagraphNode())
            }
          }
        })
        return true
      }
    }

    const codeMirrorKeymap = (): CodeMirrorKeyBinding[] => {
      return [
        {
          key: 'ArrowUp',
          run: maybeEscape('line', -1)
        },
        {
          key: 'ArrowLeft',
          run: maybeEscape('char', -1)
        },
        {
          key: 'ArrowDown',
          run: maybeEscape('line', 1)
        },
        {
          key: 'ArrowRight',
          run: maybeEscape('char', 1)
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
          }
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
    editor.getEditorState().read(() => {
      const sel = $getSelection()
      if (
        selected &&
        $isNodeSelection(sel) &&
        sel.getNodes().length === 1 &&
        sel.getNodes()[0].getKey() === nodeKey
      ) {
        codeMirror.focus()
      }
    })
  }, [codeMirror, selected])

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

  const onMouseClick = (event: MouseEvent): void => {
    const { codeDOMNode, isOutside } = getMouseInfo(event)
    if (isOutside) {
      return
    }
    if (!codeDOMNode) {
      return
    }
    editor.update(() => {
      const maybeCodeNode = $getNearestNodeFromDOMNode(codeDOMNode)
      if ($isCodeMirrorNode(maybeCodeNode) && maybeCodeNode.getKey() === props.nodeKey) {
        setSelected(true)
      }
    })
  }
  useEffect(() => {
    document.addEventListener('mousedown', onMouseClick)
    return () => {
      document.removeEventListener('mousedown', onMouseClick)
    }
  }, [])

  return (
    <div className="codeblock-container" draggable={true}>
      <div className="codeblock-header">
        <VirtualSelect
          options={languageOptions}
          onSelect={(option): void => onLanguageChange(option)}
          defaultIndex={languageOptions.findIndex((item) => item.value === language)}
          filter={(inputValue, option): boolean => languageMatch(inputValue, false, option)}
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
