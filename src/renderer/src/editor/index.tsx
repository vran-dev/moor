/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ReactNode, useCallback, useMemo, useRef, useState } from 'react'

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
import LexicalNodes from './node'
import theme from './theme/default'
import FloatingTextFormatToolbarPlugin from './plugins/FloatingMenu'
import { defaultData } from './defaultData'
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditor'
import { SlashTypeaheadPlugin } from './plugins/TypeaheadSlashPlugin'
import { EmojiTypeaheadPlugin } from './plugins/TypeaheadEmojiPlugin'
import { CodeLanguageTypeaheadPlugin } from './plugins/TypeaheadCodeLanguagePlugin'
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin'
import ImageDragDropPaste from './plugins/ImageDragDropPastePlugin'
import IFrameCodePastePlugin from './plugins/IFrameCodePastePlugin'
import { SharedHistoryContext, useSharedHistoryContext } from './context/SharedHistoryContext'
import { EditorState } from 'lexical'
import DebugPlugin from './plugins/DebugPlugin'

function onError(error) {
  console.error(error)
}

export function Editor() {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null)
  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }
  const initialConfig = {
    namespace: 'MoorEditor',
    theme,
    onError,
    nodes: [...LexicalNodes],
    editorState: JSON.stringify(defaultData)
  }

  // TODO useThrottle
  const onChange = (editorState: EditorState): void => {
    console.log(editorState.toJSON())
  }

  return (
    <div className="editor-view" ref={onRef}>
      <LexicalComposer initialConfig={initialConfig}>
        <SharedHistoryContext>
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor" spellCheck={false} />}
            placeholder={null}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <EditorPlugins />
          <OnChangePlugin onChange={(state: EditorState) => onChange(state)} />
          {/* {floatingAnchorElem && <DraggableBlockPlugin anchorElem={floatingAnchorElem} />} */}
        </SharedHistoryContext>
      </LexicalComposer>
    </div>
  )
}

export function EditorPlugins(props: { enableHistory?: boolean }) {
  const { historyState } = useSharedHistoryContext()
  return (
    <>
      {/* TODO if open empty editor then enable autofocus */}
      {/* <AutoFocusPlugin defaultSelection="rootStart" /> */}
      <CheckListPlugin />
      <ListPlugin />
      <LexicalClickableLinkPlugin />
      {props.enableHistory !== false && <HistoryPlugin externalHistoryState={historyState} />}
      <HorizontalRulePlugin />
      <TablePlugin />
      <MarkdownPlugin />
      <LinkPlugin />
      <TabIndentationPlugin />
      <HashtagPlugin />
      <FloatingTextFormatToolbarPlugin />
      <FloatingLinkEditorPlugin />
      <SlashTypeaheadPlugin />
      <CodeLanguageTypeaheadPlugin />
      <ImageDragDropPaste />
      <IFrameCodePastePlugin />
      <EmojiTypeaheadPlugin />
      {/* <DebugPlugin /> */}
    </>
  )
}
