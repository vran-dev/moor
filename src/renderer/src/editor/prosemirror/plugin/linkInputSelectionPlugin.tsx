/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet, DecorationSource } from 'prosemirror-view'

export const FocusSelectionPluginKey = new PluginKey('focus-selection-plugin')
interface LinkInputSelctionState {
  visible: boolean
  decorations?: Decoration[] | undefined
}

export const FocusSelectionPlugin = (options: LinkInputSelctionState) => {
  return new Plugin({
    key: FocusSelectionPluginKey,
    state: {
      init: (): LinkInputSelctionState => {
        return { visible: false, decorations: [] }
      },
      apply: (tr, value, oldState, newState): LinkInputSelctionState => {
        const meta: LinkInputSelctionState = tr.getMeta(FocusSelectionPluginKey)
        if (meta && meta.visible) {
          const { from, to } = newState.selection
          const decoration = Decoration.inline(from, to, {
            class: 'selection-focus'
          })
          return { visible: meta.visible, decorations: [decoration] }
        }
        return { visible: false, decorations: [] }
      }
    },
    props: {
      decorations(state): DecorationSource {
        const pluginState: LinkInputSelctionState | undefined = this.getState(state)
        // maybe decorations: [null], shold filter non null values
        const decorations = (pluginState?.decorations || []).filter((d) => d != null)
        if (!decorations.length) {
          return DecorationSet.empty
        }
        return DecorationSet.create(state.doc, decorations)
      }
    }
  })
}
