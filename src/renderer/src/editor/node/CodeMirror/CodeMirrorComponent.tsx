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
  $setSelection,
  $createNodeSelection,
  COMMAND_PRIORITY_LOW,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_DOWN_COMMAND,
  KEY_ENTER_COMMAND,
  NodeKey,
  $addUpdateTag,
  REDO_COMMAND,
  UNDO_COMMAND,
  $isNodeSelection,
  $isDecoratorNode
} from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import { $isCodeMirrorNode, CodeblockLayout } from '.'
import './index.css'
import { LanguageInfo, languageInfos, languageMatch, listLanguages } from './CodeMirrorLanguages'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import Select from 'react-select'
import useModal from '@renderer/ui/Modal/useModal'
import { CodePreviewComponent } from './CodePreviewComponent'
import { VscSplitVertical } from 'react-icons/vsc'
import { BiCodeCurly } from 'react-icons/bi'
import { PiPresentationChartLight } from 'react-icons/pi'

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
  const defaultLanguageOption = useMemo(() => {
    if (language) {
      const matchedLanges = listLanguages({ query: language, nameFullMatch: true })
      if (matchedLanges.length > 0) {
        const option = {
          label: matchedLanges[0].name,
          value: matchedLanges[0].name,
          ...matchedLanges[0]
        }
        setSelectLanguage(option)
        return option
      }
    }
    return null
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
  const updateLexicalNodeData = useCallback(
    (latest: string) =>
      editor.update(() => {
        const node = $getNodeByKey(nodeKey)
        if ($isCodeMirrorNode(node)) {
          node.setData(latest)
        }
      }),
    [editor, nodeKey]
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
      console.log('change layout value to', value)
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
  return (
    <>
      <div className="codeblock-container">
        <div className="codeblock-header">
          <Select
            defaultValue={defaultLanguageOption}
            onChange={onLanguageChange}
            options={languageOptions}
            filterOption={(option, inputValue): boolean =>
              languageMatch(inputValue, false, option.data)
            }
            classNames={{
              container: (state) => 'react-select-container',
              control: (state) => 'react-select-control',
              valueContainer: (state) => 'react-select-value-container',
              menu: (state) => 'react-select-menu'
            }}
          />
          <CodeblockLayoutSelect onChange={onLanguageChange} layout={layout} />
        </div>
        <div className="codeblock-main">
          {shouldShowCodeData() && <div className="codeblock-editor" ref={editorRef}></div>}
          {shouldShowCodePreview() && <CodeblockPreview language={selectLanguage} data={data} />}
        </div>
      </div>
    </>
  )
}

function CodeblockLayoutSelect(props: { onChange: (e) => void; layout: string }): JSX.Element {
  const options = useMemo(() => {
    const iconProps = {
      size: 12
    }
    return [
      {
        name: 'code',
        value: 'Code',
        icon: <BiCodeCurly {...iconProps} />
      },
      {
        name: 'preview',
        value: 'Preview',
        icon: <PiPresentationChartLight {...iconProps} />
      },
      {
        name: 'split vertical',
        value: 'SplitVertical',
        icon: <VscSplitVertical {...iconProps} />
      }
    ]
  }, [])

  return (
    <div onChange={(e): void => props.onChange(e.target.value)} defaultValue={props.layout}>
      {options.map((option) => {
        return (
          <button key={option.value} className="select-option">
            {option.icon} {option.name}
          </button>
        )
      })}
    </div>
  )
}

function CodeblockPreview(props: { language: LanguageInfo; data: string }): JSX.Element {
  const previewContainerRef = useRef<HTMLDivElement | null>(null)
  const { language, data } = props
  const [modal, showModal] = useModal()
  const showPreviewModal = useCallback((): void => {
    if (language === null) {
      return
    }
    showModal(language.name, (onClose) => {
      return <CodePreviewComponent languageInfo={language} onClose={onClose} codeData={data} />
    })
  }, [language, data])

  useEffect(() => {
    if (!previewContainerRef || !previewContainerRef.current) {
      return
    }
    if (language && language.preview) {
      language.preview(data, previewContainerRef.current)
    }
  }, [language, data])
  return (
    <>
      <div
        className="codeblock-preview"
        ref={previewContainerRef}
        onClick={(): void => showPreviewModal()}
      ></div>
      {modal}
    </>
  )
}
