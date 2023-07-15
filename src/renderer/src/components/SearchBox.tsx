import { searchPlugin } from '@renderer/extensions/search/searchPlugin'
import { Editor } from '@tiptap/react'
import { ChangeEvent, useEffect, useState } from 'react'
import { Plugin } from 'prosemirror-state'
import { useSelector } from 'react-redux'

interface SearchOptions {
  editor: Editor
  placeholder?: string
  searchKeyword?: string
  show?: boolean
  onChange?: (keyword: string) => void
  onClose?: () => void
  onSearchNext?: (keyword: string) => void
  onSearchPrev?: (keyword: string) => void
}

export const SearchBox = (props: SearchOptions): JSX.Element => {
  const showSearchInPageBox = useSelector((store: any) => store.searchInPageBox.value)
  useEffect(() => {
    if (!props.editor) {
      return
    }
    if (props.editor.isDestroyed) {
      return
    }
    props.editor.registerPlugin(searchPlugin, (newPlugin: Plugin, plugins: Plugin[]): Plugin[] => {
      if (plugins.findIndex((i) => i === newPlugin) > -1) {
        return plugins
      }
      plugins.push(newPlugin)
      return plugins
    })
    return () => props.editor.unregisterPlugin('search')
  }, [props.editor])

  const onChange = (e: ChangeEvent): void => {
    e.preventDefault()
    if (props.onChange) {
      props.onChange(e.target.value)
    } else {
      searchPlugin.searchByKeyword(props.editor.view, e.target.value)
    }
  }
  return (
    <>
      <div className="relative mb-6" style={{ display: showSearchInPageBox ? 'block' : 'none' }}>
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
          <svg
            className="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
          >
            <path
              d="M883.2 823.466667L665.6 605.866667C704 554.666667 725.333333 492.8 725.333333 426.666667c0-164.266667-134.4-298.666667-298.666666-298.666667S128 262.4 128 426.666667s134.4 298.666667 298.666667 298.666666c66.133333 0 128-21.333333 179.2-59.733333l217.6 217.6c17.066667 17.066667 42.666667 17.066667 59.733333 0 17.066667-17.066667 17.066667-42.666667 0-59.733333zM213.333333 426.666667c0-117.333333 96-213.333333 213.333334-213.333334s213.333333 96 213.333333 213.333334-96 213.333333-213.333333 213.333333-213.333333-96-213.333334-213.333333z"
              fill="#999999"
            ></path>
          </svg>
        </div>
        <input
          type="text"
          id="input-group-1"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder={props.placeholder || 'Search'}
          value={props.searchKeyword}
          onChange={(event): void => onChange(event)}
        ></input>
      </div>
    </>
  )
}
