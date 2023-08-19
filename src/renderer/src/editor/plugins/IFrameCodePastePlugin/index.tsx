/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createIFrameNode, $isIFrameTag } from '@renderer/editor/node/IFrame'
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  PASTE_COMMAND,
  PasteCommandType
} from 'lexical'
import { useEffect } from 'react'

export default function IFrameCodePastePlugin(): null {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (payload: PasteCommandType) => {
        if (payload instanceof ClipboardEvent) {
          const clipboardData = payload.clipboardData
          if (clipboardData) {
            const pastedText = clipboardData.getData('text/plain')
            if ($isIFrameTag(pastedText)) {
              editor.update(() => {
                const selection = $getSelection()
                if ($isRangeSelection(selection)) {
                  const node = $createIFrameNode(pastedText)
                  selection.insertNodes([node])
                }
              })
              return true
            }
          }
        }
        return false
      },
      COMMAND_PRIORITY_LOW
    )
  }, [editor])
  return null
}
