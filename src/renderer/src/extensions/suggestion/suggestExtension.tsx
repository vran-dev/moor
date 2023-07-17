/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Extension, Editor, Range, ReactRenderer } from '@tiptap/react'
import { CommandProps, SuggestComponent } from './suggestComponent'
import tippy from 'tippy.js'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Suggestion } from './suggestion'
import { suggestLanguages } from '../codeblock/suggestLanguages'
import { suggestSlashCommands } from '../slash/slashItems'

const SuggestExtension = Extension.create({
  addOptions() {
    return {
      suggestion: {
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: any }): void => {
          props.command({ editor, range })
        }
      }
    }
  },

  addProseMirrorPlugins(): Plugin[] {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion
      })
    ]
  }
})

const defaultRender = (): any => {
  let component: ReactRenderer | null = null
  let popup: any | null = null

  return {
    onStart: (props: { editor: Editor; clientRect: DOMRect }) => {
      component = new ReactRenderer(SuggestComponent, {
        props,
        editor: props.editor
      })
      // @ts-ignore
      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start'
      })
    },

    onUpdate: (props: { editor: Editor; clientRect: DOMRect }) => {
      component?.updateProps(props)
      if (!props.clientRect) {
        return
      }
      popup[0].setProps({
        getReferenceClientRect: props.clientRect
      })
    },

    onKeyDown: (props: { event: KeyboardEvent }) => {
      if (props.event.key === 'Escape') {
        popup?.[0].hide()
        return true
      }
      return component?.ref?.onKeyDown(props)
    },

    onExit: () => {
      popup?.[0].destroy()
      component?.destroy()
    }
  }
}

const SlashCommandSuggestion = SuggestExtension.configure({
  name: 'slashSuggestions',
  suggestion: {
    char: '/',
    pluginKey: new PluginKey('slashSuggestions'),
    items: suggestSlashCommands,
    render: defaultRender
  }
})

const LanguageSuggestion = SuggestExtension.configure({
  name: 'languageSuggestions',
  suggestion: {
    char: '```',
    pluginKey: new PluginKey('languageSuggestions'),
    items: suggestLanguages,
    render: defaultRender
  }
})

export { SlashCommandSuggestion, LanguageSuggestion }
