import { extension } from '@remirror/core'
import { FocusSelectionPlugin } from '@renderer/editor/prosemirror/plugin/linkInputSelectionPlugin'
import { PluginsExtension } from 'remirror'

export interface FocusSelectionExtensionOptions {
  className?: string
}

export class FocusSelectionExtension extends PluginsExtension {
  get name() {
    return 'FocusSelectionPlugin' as const
  }

  createPlugin() {
    return FocusSelectionPlugin({ visible: false })
  }
}
