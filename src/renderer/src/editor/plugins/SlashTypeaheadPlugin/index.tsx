/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  TypeaheadChildrenProps,
  TypeaheadMenu,
  TypeaheadPlugin,
  TypeaheadVirtualListMenu
} from '../TypeheadPlugin'
import { $createCodeNode } from '@lexical/code'
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND
} from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import { $createParagraphNode, $createTextNode, $getSelection, $isRangeSelection, LexicalEditor } from 'lexical'
import { ReactNode } from 'react'
import {
  AiOutlineUnorderedList,
  AiOutlineOrderedList,
  AiOutlineTable,
  AiOutlineCheckSquare,
  AiOutlineCode,
  AiOutlineSmile,
  AiOutlineFontSize
} from 'react-icons/ai'
import { LiaQuoteLeftSolid } from 'react-icons/lia'
import { LuHeading1, LuHeading2, LuHeading3 } from 'react-icons/lu'

const ICON_SIZE = 20

const ICON_PROPS = {
  size: ICON_SIZE
}

export const SlashTypeaheadPlugin = (): ReactNode => {
  const [editor] = useLexicalComposerContext()

  const getOptions = async (query: string) => {
    const baseOptions: TypeaheadMenu[] = [
      new TypeaheadMenu(
        'Heading 1',
        <LuHeading1 {...ICON_PROPS} />,
        'first level heading',
        (editor: LexicalEditor) => {
          editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode(`h1`))
            }
          })
        }
      ),
      new TypeaheadMenu(
        'Heading 2',
        <LuHeading2 {...ICON_PROPS} />,
        'second level heading',
        (editor: LexicalEditor) => {
          editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode(`h2`))
            }
          })
        }
      ),
      new TypeaheadMenu(
        'Heading 3',
        <LuHeading3 {...ICON_PROPS} />,
        'third level heading',
        (editor: LexicalEditor) => {
          editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createHeadingNode(`h3`))
            }
          })
        }
      ),
      new TypeaheadMenu(
        'Bulleted List',
        <AiOutlineUnorderedList {...ICON_PROPS} />,
        'turn into unsorted list',
        (editor: LexicalEditor) => {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
      ),
      new TypeaheadMenu(
        'Ordered List',
        <AiOutlineOrderedList {...ICON_PROPS} />,
        'turn into sorted list',
        (editor: LexicalEditor) => {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
      ),
      new TypeaheadMenu(
        'Table',
        <AiOutlineTable {...ICON_PROPS} />,
        'create simple table',
        (editor: LexicalEditor) => {}
      ),
      new TypeaheadMenu(
        'Task',
        <AiOutlineCheckSquare {...ICON_PROPS} />,
        'tracking todo tasks',
        (editor: LexicalEditor) => {
          editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)
        }
      ),
      new TypeaheadMenu(
        'Quote',
        <LiaQuoteLeftSolid {...ICON_PROPS} />,
        'quote text',
        (editor: LexicalEditor) => {
          editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createQuoteNode())
            }
          })
        }
      ),
      new TypeaheadMenu(
        'Excalidraw',
        <LiaQuoteLeftSolid />,
        'drawing with Excalidraw',
        (editor: LexicalEditor) => {}
      ),
      new TypeaheadMenu(
        'Code Block',
        <AiOutlineCode {...ICON_PROPS} />,
        'create codeblock',
        (editor: LexicalEditor) => {
          editor.update(() => {
            const selection = $getSelection()

            if ($isRangeSelection(selection)) {
              if (selection.isCollapsed()) {
                $setBlocksType(selection, () => $createCodeNode())
              } else {
                // Will this ever happen?
                const textContent = selection.getTextContent()
                const codeNode = $createCodeNode()
                selection.insertNodes([codeNode])
                selection.insertRawText(textContent)
              }
            }
          })
        }
      ),
      new TypeaheadMenu(
        'Emoji',
        <AiOutlineSmile {...ICON_PROPS} />,
        'select emoji from picker',
        (editor: LexicalEditor) => {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            const textNode = $createTextNode(':')
            selection.insertNodes([textNode])
          }
        }
      ),
      new TypeaheadMenu(
        'Text',
        <AiOutlineFontSize {...ICON_PROPS} />,
        'plain text',
        (editor: LexicalEditor) => {
          editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createParagraphNode())
            }
          })
        }
      )
    ]
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
    trigger: '/',
    Children: (props: TypeaheadChildrenProps<TypeaheadMenu>) => TypeaheadVirtualListMenu(props)
  })
}
