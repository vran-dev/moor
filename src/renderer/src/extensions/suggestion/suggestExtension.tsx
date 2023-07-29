/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Extension, Editor, Range, ReactRenderer, textInputRule } from '@tiptap/react'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Suggestion } from './suggestion'
import { suggestLanguages } from '../codeblock/suggestLanguages'
import { suggestSlashCommands } from '../slash/slashItems'
import { suggestLinks } from '../link/suggestLinks'
import { defaultSuggestRenderer } from './defaultSuggestRenderer'
import { emojiSuggestRenderer } from '../emoji/emojiSuggestRenderer'
import { suggestEmojis } from '../emoji/suggestEmojis'

const SlashCommandSuggestion = Extension.create({
  name: 'slashSuggestions',
  addOptions() {
    return {
      suggestion: {
        char: '/',
        pluginKey: new PluginKey('slashSuggestions'),
        items: suggestSlashCommands,
        render: defaultSuggestRenderer,
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: any }): void => {
          props.command({ editor, range })
        },
        metaCombinationKey: '/'
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

const LanguageSuggestion = Extension.create({
  name: 'languageSuggestions',
  addOptions() {
    return {
      suggestion: {
        char: '```',
        pluginKey: new PluginKey('languageSuggestions'),
        items: suggestLanguages,
        render: defaultSuggestRenderer,
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

const LinkSuggestion = Extension.create({
  name: 'linkSuggestion',
  addOptions() {
    return {
      suggestion: {
        char: '[[',
        pluginKey: new PluginKey('linkSuggestion'),
        items: suggestLinks,
        render: defaultSuggestRenderer,
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: any }): void => {
          props.command({ editor, range })
        }
      }
    }
  },
  addInputRules() {
    return [
      textInputRule({
        find: /【{2}/,
        replace: '[['
      })
    ]
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

const EmojiSuggestion = Extension.create({
  name: 'emojiSuggestion',
  addOptions() {
    return {
      suggestion: {
        char: '::',
        pluginKey: new PluginKey('emojiSuggestion'),
        items: suggestEmojis,
        render: emojiSuggestRenderer,
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: any }): void => {
          // do nothing
        }
      }
    }
  },
  addInputRules() {
    return [
      textInputRule({
        find: /：{2}/,
        replace: '::'
      })
    ]
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

export { SlashCommandSuggestion, LanguageSuggestion, LinkSuggestion, EmojiSuggestion }
