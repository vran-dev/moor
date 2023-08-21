/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  TypeaheadChildrenProps,
  TypeaheadMenu,
  TypeaheadPlugin,
  TypeaheadVirtualListMenu
} from '../TypeheadPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createCodeMirrorNode } from '@renderer/editor/node/CodeMirror'
import { languageInfos } from '@renderer/editor/node/CodeMirror/languages'
import { $createNodeSelection, $getSelection, $isRangeSelection, $setSelection } from 'lexical'

import { ReactNode } from 'react'

export const CodeLanguageTypeaheadPlugin = (): ReactNode => {
  const [editor] = useLexicalComposerContext()

  const getOptions = async (query: string) => {
    const createCodeMirrorNode = (language: string) => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const node = $createCodeMirrorNode('', language)
        selection.insertNodes([node])
        const ns = $createNodeSelection()
        // const rs = $createRangeSelection()
        ns.add(node.getKey())
        $setSelection(ns)
      }
    }
    const baseOptions: TypeaheadMenu[] = languageInfos.map((lang) => {
      return new TypeaheadMenu(lang.name, null, '', () => createCodeMirrorNode(lang.name), [
        ...lang.alias
      ])
    })
    return query
      ? [
          ...baseOptions.filter((option) => {
            const matchByTitle = (): boolean => {
              return new RegExp(query, 'gi').exec(option.title) != null
            }
            const matchByDescription = (): boolean => {
              return new RegExp(query, 'gi').exec(option.description) != null
            }
            const matchByKeywords = (): boolean => {
              if (!option.keywords) {
                return false
              }
              return option.keywords.some((keyword) => new RegExp(query, 'gi').exec(keyword))
            }
            return matchByTitle() || matchByDescription() || matchByKeywords()
          })
        ]
      : baseOptions
  }
  return TypeaheadPlugin<TypeaheadMenu>({
    editor: editor,
    getOptions: getOptions,
    trigger: '```',
    Children: (props: TypeaheadChildrenProps<TypeaheadMenu>) => TypeaheadVirtualListMenu(props)
  })
}
