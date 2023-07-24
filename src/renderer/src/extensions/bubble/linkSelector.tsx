/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Editor } from '@tiptap/core'
import { Dispatch, FC, SetStateAction, useEffect, useRef, useState } from 'react'
import { linkFormPluginKey } from '../link/linkFormPlugin'

interface LinkSelectorProps {
  editor: Editor
}

export const LinkSelector: FC<LinkSelectorProps> = ({ editor }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [meta, setMeta] = useState({})
  const [url, setUrl] = useState(null)
  const isOpen = false

  // Autofocus on input by default
  useEffect(() => {
    inputRef.current && inputRef.current?.focus()
  })

  const getUrlInfo = async (e) => {
    const url = e.target.value
    setUrl(url)
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

  const setLink = (e) => {
    const metaTr = editor?.view.state.tr.setMeta(linkFormPluginKey, { visible: true })
    editor?.view.dispatch(metaTr)
    editor.chain().focus().run()
    // setIsOpen(true)
    // editor
    //   .chain()
    //   .focus()
    //   .setLink({ href: url || '' })
    //   .run()
  }

  const unsetLink = (e) => {
    editor.chain().focus().unsetLink().run()
    setUrl(null)
  }

  return (
    <div className="relative">
      <button
        className="link-menu"
        onClick={(e) => {
          setLink(e)
        }}
      >
        <p className="text">↗</p>
        <p className={editor.isActive('link') ? 'active' : ''}>Link</p>
      </button>
      {isOpen && (
        <div className={'link-wrapper'}>
          <div className="link-form">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type or paste URL"
              onChange={(e) => getUrlInfo(e)}
              defaultValue={editor.getAttributes('link').href || ''}
            />

            {editor.getAttributes('link').href ? (
              <button onClick={(e) => unsetLink(e)}>
                {/* <Trash className="h-4 w-4" /> */}
                Delete
              </button>
            ) : (
              <button onClick={(e) => setLink(e)}>
                {/* <Check className="h-4 w-4" /> */}
                Save
              </button>
            )}
          </div>
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
    </div>
  )
}
