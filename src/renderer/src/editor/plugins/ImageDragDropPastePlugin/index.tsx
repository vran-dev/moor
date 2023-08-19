/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { DRAG_DROP_PASTE } from '@lexical/rich-text'
import { isMimeType, mediaFileReader } from '@lexical/utils'
import { $createImageNode } from '@renderer/editor/node/Image'
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW } from 'lexical'
import { useEffect } from 'react'

const ACCEPTABLE_IMAGE_TYPES = ['image/', 'image/heic', 'image/heif', 'image/gif', 'image/webp']

export default function ImageDragDropPaste(): null {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    return editor.registerCommand(
      DRAG_DROP_PASTE,
      (files) => {
        ;(async () => {
          const filesResult = await mediaFileReader(
            files,
            [ACCEPTABLE_IMAGE_TYPES].flatMap((x) => x)
          )
          for (const { file, result } of filesResult) {
            if (isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) {
              editor.update(() => {
                const selection = $getSelection()
                if ($isRangeSelection(selection)) {
                  const node = $createImageNode({
                    src: result,
                    altText: file.name
                  })
                  selection.insertNodes([node])
                }
              })
            }
          }
        })()
        return true
      },
      COMMAND_PRIORITY_LOW
    )
  }, [editor])
  return null
}
