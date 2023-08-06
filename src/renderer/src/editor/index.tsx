/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { $getRoot, $getSelection } from 'lexical'
import { useEffect, useState } from 'react'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin'
import MarkdownPlugin from './plugins/MarkdownShortcut'
import { TablePlugin } from '@lexical/react/LexicalTablePlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin'
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin'
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin'
import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin'
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LexicalNodeMenuPlugin } from '@lexical/react/LexicalNodeMenuPlugin'
import { LexicalTypeaheadMenuPlugin } from '@lexical/react/LexicalTypeaheadMenuPlugin'
import LexicalNodes from './node'
import theme from './theme/default'
import NewMentionsPlugin from './plugins/Suggestion'

// Lexical React plugins are React components, which makes them
// highly composable. Furthermore, you can lazy load plugins if
// desired, so you don't pay the cost for plugins until you
// actually use them.
function MyCustomAutoFocusPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    // Focus the editor when the effect fires!
    editor.focus()
  }, [editor])

  return null
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error) {
  console.error(error)
}

export function Editor() {
  const [editorState, setEditorState] = useState()
  function onChange(editorState) {
    setEditorState(editorState)
  }
  const initialConfig = {
    namespace: 'MyEditor',
    theme,
    onError,
    nodes: [...LexicalNodes]
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable className="editor" />}
        placeholder={<span>Enter some text...</span>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <AutoFocusPlugin />
      <CheckListPlugin />
      <ListPlugin />
      <LexicalClickableLinkPlugin />
      <HistoryPlugin />
      <HorizontalRulePlugin />
      <TablePlugin />
      <MarkdownPlugin />
      <LinkPlugin />
      <TabIndentationPlugin />
      <HashtagPlugin />
      {/* <LexicalNodeMenuPlugin /> */}
      {/* <LexicalTypeaheadMenuPlugin props/> */}
      <NewMentionsPlugin />
      <OnChangePlugin onChange={onChange} />
    </LexicalComposer>
  )
}
