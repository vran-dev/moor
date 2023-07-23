/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Editor } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import { LinkFormPlugin } from './linkFormPlugin'

export const LinkFormComponent = (props: {
  editor: Editor
  onSave: (input) => void
  onReset: () => void
  updateDelay?: number
  pluginKey?: string
  shouldShow?: any
  tippyOptions?: any
}): JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [meta, setMeta] = useState({})
  const [element, setElement] = useState<HTMLDivElement | null>(null)
  const editor = props.editor
  const { updateDelay, pluginKey = 'linkForm', shouldShow, tippyOptions } = props

  // Autofocus on input by default
  useEffect(() => {
    inputRef.current && inputRef.current?.focus()
  })
  useEffect(() => {
    if (!element) {
      return
    }
    if (props.editor.isDestroyed) {
      return
    }
    const plugin = LinkFormPlugin({
      updateDelay,
      editor,
      element,
      pluginKey,
      shouldShow,
      tippyOptions
    })
    editor.registerPlugin(plugin)
    return () => editor.unregisterPlugin(pluginKey)
  }, [props.editor, element])

  const getUrlInfo = async (e) => {
    const url = e.target.value
    if (!url) {
      setMeta({})
      return
    }
    const data = await fetch(url)
      .then((res) => {
        if (res.headers.get('content-type')?.includes('text/html')) {
          return res.text()
        } else {
          // ignore
          return Promise.reject('Not a HTML page')
        }
      })
      .catch((err) => {
        setMeta({})
        return null
      })
    if (!data) {
      return
    }
    const el = document.createElement('html')
    el.innerHTML = data
    const elements = el.getElementsByTagName('meta')
    const meta: { title?: string; description?: string; icon?: string } = {}
    for (const element of elements) {
      const name = element.getAttribute('property') || element.getAttribute('name')
      if (name === 'og:title') {
        meta.title = element.getAttribute('content') || ''
      } else if (name === 'og:description') {
        meta.description = element.getAttribute('content') || ''
      } else if (name === 'og:image') {
        meta.icon = element.getAttribute('content') || ''
      } else if (name === 'title') {
        meta.title = element.getAttribute('content') || ''
      } else if (name === 'description') {
        meta.description = element.getAttribute('content') || ''
      } else if (name === 'image') {
        meta.icon = element.getAttribute('content') || ''
      }
    }
    setMeta(meta)
  }
  return (
    <>
      {editor && (
        <div className={'link-wrapper'} ref={setElement}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const input = e.target[0] as HTMLInputElement
              editor.chain().focus().setLink({ href: input.value }).run()
              props.onSave(input.value)
            }}
            className="link-form"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Type or paste URL"
              onChange={(e) => getUrlInfo(e)}
              defaultValue={editor.getAttributes('link')?.href || ''}
            />

            {editor.getAttributes('link')?.href ? (
              <button
                onClick={() => {
                  editor.chain().focus().unsetLink().run()
                  props.onReset()
                }}
              >
                {/* <Trash className="h-4 w-4" /> */}
                Delete
              </button>
            ) : (
              <button>
                {/* <Check className="h-4 w-4" /> */}
                Save
              </button>
            )}
          </form>
          {meta.title && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className={'bg-white'}>{meta.title}</div>
              <div>
                <img src={meta.icon} />
              </div>
              {/* <div>
                <div>{meta.description}</div>
              </div> */}
            </div>
          )}
        </div>
      )}
    </>
  )
}
