/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { debounce } from '@renderer/common/debounce'
import { LexicalEditor } from 'lexical'
import { useEffect, useRef, useState } from 'react'

export const FloatingLinkEditor = (props: {
  editor: LexicalEditor
  onSave?: (input) => void
  onReset?: () => void
  onInputFocus?: () => void
  onInputBlur?: () => void
}): JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [meta, setMeta] = useState({})
  const [element, setElement] = useState<HTMLDivElement | null>(null)
  // Autofocus on input by default
  useEffect(() => {
    // inputRef.current && inputRef.current?.focus()
  }, [])

  const convertToUrlCard = (e) => {
    // debounce(async () => {
    //   const url = e.target.value
    //   if (!url) {
    //     setMeta({})
    //     return
    //   }
    //   const data = await fetch(url)
    //     .then((res) => {
    //       if (res.headers.get('content-type')?.includes('text/html')) {
    //         return res.text()
    //       } else {
    //         // ignore
    //         return Promise.reject('Not a HTML page')
    //       }
    //     })
    //     .catch((err) => {
    //       setMeta({})
    //       return null
    //     })
    //   if (!data) {
    //     return
    //   }
    //   const el = document.createElement('html')
    //   el.innerHTML = data
    //   const elements = el.getElementsByTagName('meta')
    //   const meta: { title?: string | null; description?: string; cover?: string; icon?: string } =
    //     {}
    //   for (const element of elements) {
    //     const name = element.getAttribute('property') || element.getAttribute('name')
    //     if (name === 'og:site_name') {
    //       meta.title = element.getAttribute('content') || meta.title
    //     } else if (name === 'og:title') {
    //       meta.title = meta.title || element.getAttribute('content') || null
    //     } else if (name === 'og:description') {
    //       meta.description = element.getAttribute('content') || ''
    //     } else if (name === 'og:image') {
    //       meta.cover = element.getAttribute('content') || ''
    //     } else if (name === 'title') {
    //       meta.title = meta.title || element.getAttribute('content') || null
    //     } else if (name === 'description') {
    //       meta.description = element.getAttribute('content') || ''
    //     } else if (name === 'image') {
    //       meta.cover = meta.cover || element.getAttribute('content') || ''
    //       if (meta.cover.startsWith('./') || meta.cover.startsWith('/')) {
    //         meta.cover = new URL(meta.cover, url).href
    //       }
    //     }
    //   }
    //   if (!meta.title) {
    //     const titleElements = el.getElementsByTagName('title') || []
    //     for (const ele of titleElements) {
    //       meta.title = meta.title || ele.innerText
    //       break
    //     }
    //   }
    //   if (!meta.icon) {
    //     const titleElements = el.getElementsByTagName('link') || []
    //     for (const ele of titleElements) {
    //       const rel = ele.getAttribute('rel')
    //       if (rel === 'icon') {
    //         meta.icon = meta.icon || ele.getAttribute('href')
    //       }
    //       if (rel === 'shortcut icon') {
    //         meta.icon = ele.getAttribute('href') || meta.icon
    //       }
    //     }
    //   }
    //   setMeta(meta)
    // }, 500)()
  }

  const onSetLink = (e) => {
    const value = inputRef.current?.value || ''
    // editor.chain().focus().setLink({ href: value }).run()
    props.onSave?.(value)
  }

  const onRestLink = () => {
    // editor.chain().focus().unsetLink().run()
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    setMeta({})
    props.onReset?.()
  }
  return (
    <>
      {
        <div className={'link-wrapper'} ref={setElement}>
          <div className="link-form">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type or paste URL"
              onChange={(e) => {
                convertToUrlCard(e)
              }}
              onFocus={() => props.onInputFocus?.()}
              defaultValue={''}
            />

            <button onClick={(e) => onSetLink(e)}>
              {/* <Check className="h-4 w-4" /> */}
              save
            </button>
          </div>
          {meta.title && (
            <div className="link-card">
              {meta.cover && <img className="cover" src={meta.cover} />}
              <div className="main">
                <div className="title">
                  <img src={meta.icon} />
                  {meta.title}
                </div>
                <p className="description">{meta.description}</p>
              </div>
            </div>
          )}
        </div>
      }
    </>
  )
}
