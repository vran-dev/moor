import { Extension } from '@tiptap/react'
import { trailingNode } from 'prosemirror-trailing-node'

export const trallingNodeExtension = Extension.create({
  addProseMirrorPlugins() {
    return [trailingNode()]
  }
})
