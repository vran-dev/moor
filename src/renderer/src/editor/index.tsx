import { useEffect, useState } from 'react'
import '@renderer/assets/editor.css'
import {
  BoldExtension,
  ItalicExtension,
  CalloutExtension,
  CodeExtension,
  TextHighlightExtension,
  LinkExtension,
  UnderlineExtension,
  BlockquoteExtension,
  BulletListExtension,
  OrderedListExtension,
  TaskListExtension,
  TaskListItemExtension,
  StrikeExtension,
  HeadingExtension,
  HorizontalRuleExtension,
  HistoryExtension,
  ImageExtension,
  TrailingNodeExtension,
  ParagraphExtension,
  TableExtension,
  PlaceholderExtension,
  DropCursorExtension,
  ShortcutsExtension,
  HardBreakExtension,
  EmojiExtension,
  DocExtension,
  TextExtension,
  PositionerExtension,
  EventsExtension
} from 'remirror/extensions'

import { CodeMirrorExtension } from '@remirror/extension-codemirror6'
import { EditorComponent, FloatingToolbar, ThemeProvider, useSuggest } from '@remirror/react'
import { AllStyledComponent } from '@remirror/styles/emotion'

import { Remirror, useRemirror } from '@remirror/react'
import { FloatingMenu } from './remirror/extension/bubbleMenu/FloatingMenu'
import { FocusSelectionExtension } from './remirror/extension/focusSelection/FocusSelectionExtension'
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  LanguageSupport,
  bracketMatching,
  indentOnInput,
  foldGutter
} from '@codemirror/language'
import { defaultKeymap, indentWithTab, history } from '@codemirror/commands'
import { autocompletion, closeBrackets } from '@codemirror/autocomplete'
import { githubLightInit } from '@uiw/codemirror-theme-github'
import { mermaidHighlightStyle } from './codeMirror/language/mermaid'
import { EditorView as CodeMirror, keymap as cmKeymap, lineNumbers } from '@codemirror/view'
import { SuggestView } from './remirror/extension/slashSuggest/SuggestView'
import { defaultItems, suggestSlashCommands } from './remirror/extension/slashSuggest/slashItems'
import { ExcalidrawExtension } from './remirror/extension/excalidraw/ExcalidrawExtension'

const autoParse = (data?: string): object | string | null => {
  if (!data) {
    return null
  }
  try {
    const json = JSON.parse(data)
    return json
  } catch (err) {
    return data
  }
}

export const Editor = (props: {
  content?: string
  path?: string
  workspace?: string
}): JSX.Element => {
  // const [data, setData] = useState(autoParse(props.content))
  // const [filePath, setFilePath] = useState('')
  // const editorAttr = {
  //   spellcheck: 'false'
  // }
  // if (props.path) {
  //   editorAttr['contentFilePath'] = props.path
  // }
  // if (props.workspace) {
  //   editorAttr['workspace'] = props.workspace
  // }

  // useEffect(() => {
  //   let editorData = data
  //   try {
  //     const jsonEditorData = JSON.parse(data)
  //     editorData = jsonEditorData
  //   } catch (err) {
  //     editorData = data
  //   }
  //   // if (editor) {
  //   //   editor.commands.setContent(editorData)
  //   // }
  // }, [data])

  const { manager, state } = useRemirror({
    extensions: () => [
      new DocExtension(),
      new TextExtension(),
      new PositionerExtension(),
      new EventsExtension(),
      new BoldExtension(),
      new ItalicExtension(),
      new CalloutExtension(),
      new HeadingExtension(),
      new CodeExtension(),
      new TextHighlightExtension(),
      new LinkExtension(),
      new UnderlineExtension(),
      new BlockquoteExtension(),
      new BulletListExtension(),
      new OrderedListExtension(),
      new TaskListExtension(),
      new TaskListItemExtension(),
      new StrikeExtension(),
      new HeadingExtension(),
      new HorizontalRuleExtension(),
      new HistoryExtension(),
      new ImageExtension(),
      new TrailingNodeExtension(),
      new ParagraphExtension(),
      new TableExtension(),
      new PlaceholderExtension(),
      new DropCursorExtension(),
      new ShortcutsExtension(),
      new HardBreakExtension(),
      new EmojiExtension(),
      // new FocusSelectionExtension()
      new ExcalidrawExtension(),
      new CodeMirrorExtension({
        extensions: [
          cmKeymap.of([indentWithTab, ...defaultKeymap]),
          indentOnInput(),
          autocompletion(),
          CodeMirror.lineWrapping,
          foldGutter(),
          // highlightActiveLine(),
          // drawSelection(),
          lineNumbers(),
          history(),
          closeBrackets(),
          bracketMatching(),
          syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
          syntaxHighlighting(mermaidHighlightStyle, { fallback: false }),
          githubLightInit({
            settings: {
              background: '#EEE',
              gutterBackground: 'transparent',
              selection: 'default'
            }
          })
        ]
      })
    ],
    // Set the initial content.
    content: '<p>I love <b>Remirror</b></p><div data-type="excalidraw"></div>',

    // Place the cursor at the start of the document. This can also be set to
    // `end`, `all` or a numbered position.
    selection: 'start',

    // Set the string handler which means the content provided will be
    // automatically handled as html.
    // `markdown` is also available when the `MarkdownExtension`
    // is added to the editor.
    stringHandler: 'html'
  })

  return (
    <>
      <AllStyledComponent>
        <ThemeProvider>
          <div className="editor-view remirror-theme">
            <Remirror manager={manager} initialContent={state} autoFocus>
              <EditorComponent />
              <FloatingMenu></FloatingMenu>
              <SuggestView
                items={defaultItems}
                apply={(item): void => console.log(item)}
              ></SuggestView>
            </Remirror>
          </div>
        </ThemeProvider>
      </AllStyledComponent>
    </>
  )
}
