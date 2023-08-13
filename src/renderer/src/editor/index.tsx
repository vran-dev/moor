/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useState } from 'react'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
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
import FloatingTextFormatToolbarPlugin from './plugins/FloatingMenu'
import { defaultData } from './defaultData'
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditor'
import SlashMenuPlugin from './plugins/SlashMenu'
import { SlashTypeaheadPlugin } from './plugins/TypeaheadSlashPlugin'
import { EmojiTypeaheadPlugin } from './plugins/TypeaheadEmojiPlugin'

function onError(error) {
  console.error(error)
}

export function Editor() {
  const [editorState, setEditorState] = useState()
  function onChange(editorState) {
    setEditorState(editorState)
    const editorStateJSON = editorState.toJSON()
    const data = JSON.stringify(editorStateJSON)
    // console.log(editorStateJSON)
  }

  const initialConfig = {
    namespace: 'MyEditor',
    theme,
    onError,
    nodes: [...LexicalNodes],
    editorState: JSON.stringify(defaultData)
  }
  return (
    <div className="editor-view">
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor" spellCheck={false} />}
          placeholder={null}
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
        <FloatingTextFormatToolbarPlugin />
        <FloatingLinkEditorPlugin />
        <SlashTypeaheadPlugin />
        <EmojiTypeaheadPlugin />
        {/* <LexicalNodeMenuPlugin /> */}
        <OnChangePlugin onChange={onChange} />
      </LexicalComposer>
    </div>
  )
}
