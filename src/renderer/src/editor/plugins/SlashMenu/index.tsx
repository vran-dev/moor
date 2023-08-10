/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  useBasicTypeaheadTriggerMatch,
  LexicalTypeaheadMenuPlugin,
  MenuOption
} from '@lexical/react/LexicalTypeaheadMenuPlugin'
import useModal from 'antd/es/modal/useModal'
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  LexicalEditor,
  TextNode
} from 'lexical'
import { ReactNode, useCallback, useMemo, useState } from 'react'
import ReactDOM from 'react-dom'
import {
  AiOutlineTable,
  AiOutlineUnorderedList,
  AiOutlineOrderedList,
  AiOutlineCheckSquare,
  AiOutlineFontSize,
  AiOutlineCode,
  AiOutlineDelete,
  AiOutlineInsertRowAbove,
  AiOutlineInsertRowBelow,
  AiOutlineInsertRowLeft,
  AiOutlineInsertRowRight,
  AiOutlineDeleteRow,
  AiOutlineDeleteColumn,
  AiOutlineSmile,
  AiOutlineCalendar
} from 'react-icons/ai'
import { LuHeading1, LuHeading2, LuHeading3, LuHeading4 } from 'react-icons/lu'
import { LiaQuoteLeftSolid } from 'react-icons/lia'
import './index.css'
import { $setBlocksType } from '@lexical/selection'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND
} from '@lexical/list'
import { $createCodeNode } from '@lexical/code'

export class SlashMenuItem extends MenuOption {
  title: string
  icon: React.ReactNode
  description: string
  keywords?: string[]
  command: (editor: LexicalEditor) => void
  onHover?: () => void
  onLeave?: () => void

  constructor(
    title: string,
    icon: React.ReactNode,
    description: string,
    command: (editor: LexicalEditor) => void,
    keywords?: string[],
    onHover?: () => void,
    onLeave?: () => void
  ) {
    super(title)
    this.title = title
    this.icon = icon
    this.description = description
    this.keywords = keywords || []
    this.command = command
    this.onHover = onHover
    this.onLeave = onLeave
  }
}

const ICON_SIZE = 20

const ICON_PROPS = {
  size: ICON_SIZE
}

export default function SlashMenuPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const [queryString, setQueryString] = useState<string | null>(null)

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0
  })

  const options = useMemo(() => {
    const baseOptions: SlashMenuItem[] = [
      new SlashMenuItem(
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
      new SlashMenuItem(
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
      new SlashMenuItem(
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
      new SlashMenuItem(
        'Bulleted List',
        <AiOutlineUnorderedList {...ICON_PROPS} />,
        'turn into unsorted list',
        (editor: LexicalEditor) => {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
      ),
      new SlashMenuItem(
        'Ordered List',
        <AiOutlineOrderedList {...ICON_PROPS} />,
        'turn into sorted list',
        (editor: LexicalEditor) => {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
      ),
      new SlashMenuItem(
        'Table',
        <AiOutlineTable {...ICON_PROPS} />,
        'create simple table',
        (editor: LexicalEditor) => {}
      ),
      new SlashMenuItem(
        'Task',
        <AiOutlineCheckSquare {...ICON_PROPS} />,
        'tracking todo tasks',
        (editor: LexicalEditor) => {
          editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)
        }
      ),
      new SlashMenuItem(
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
      new SlashMenuItem(
        'Excalidraw',
        <LiaQuoteLeftSolid />,
        'drawing with Excalidraw',
        (editor: LexicalEditor) => {}
      ),
      new SlashMenuItem(
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
      new SlashMenuItem(
        'Emoji',
        <AiOutlineSmile {...ICON_PROPS} />,
        'select emoji from picker',
        (editor: LexicalEditor) => {}
      ),
      new SlashMenuItem(
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

    return queryString
      ? [
          ...baseOptions.filter((option) => {
            const matchByTitle = (): boolean => {
              return new RegExp(queryString, 'gi').exec(option.title) != null
            }
            const matchByDescription = (): boolean => {
              return new RegExp(queryString, 'gi').exec(option.description) != null
            }
            const matchByKeywords = (): boolean => {
              if (!option.keywords) {
                return false
              }
              return option.keywords.some((keyword) => new RegExp(queryString, 'gi').exec(keyword))
            }
            return matchByTitle() || matchByDescription() || matchByKeywords()
          })
        ]
      : baseOptions
  }, [editor, queryString])

  const onSelectOption = useCallback(
    (
      selectedOption: SlashMenuItem,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string
    ) => {
      editor.update(() => {
        if (nodeToRemove) {
          nodeToRemove.remove()
        }
        selectedOption.command(editor)
        closeMenu()
      })
    },
    [editor]
  )

  return (
    <>
      <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
        onQueryChange={setQueryString}
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        options={options}
        menuRenderFn={(
          anchorElementRef,
          { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
        ) =>
          anchorElementRef.current && options.length
            ? ReactDOM.createPortal(
                <div className="context-menu">
                  <div>
                    {options.map((option, i: number) => (
                      <button
                        key={i}
                        data-index={i}
                        className={`context-menu-item ${i === selectedIndex ? 'selected' : ''}`}
                        onClick={(): void => {
                          option.command(editor)
                        }}
                        ref={option.setRefElement}
                      >
                        {option.icon && <div className="icon">{option.icon}</div>}
                        <div className={'info'}>
                          <div className="title">{option.title}</div>
                          <div className="description">{option.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>,
                anchorElementRef.current
              )
            : null
        }
      />
    </>
  )
}
