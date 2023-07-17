import { LanguageBlock } from './suggestLanguages'
import mermaid from 'mermaid'
import Zoomable from '@renderer/common/zoomable'
import { CommandProps } from '../suggestion/suggestComponent'

const debounce = (fn: (...args: any[]) => void, delay: number): (() => void) => {
  let timer: number
  return function (...args: any[]) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

export class LivePreview {
  id: string
  dom: HTMLElement
  parentDom?: HTMLElement
  constructor(id: string, dom: HTMLElement, parentDom?: HTMLElement) {
    this.id = id
    this.dom = dom
    this.parentDom = parentDom
  }

  show(content: string): void {
    debounce(() => {
      if (this.dom.attributes.getNamedItem('data-processed')) {
        this.dom.attributes.removeNamedItem('data-processed')
      }
      this.dom.innerHTML = content
      if (content) {
        mermaid
          .run({
            nodes: [this.dom]
          })
          .then(() => {
            this.dom.style.display = 'inherit'
          })
          .catch((error) => {
            this.dom.style.display = 'none'
            console.error('render mermaid failed', error)
          })
      }
    }, 100)()
  }

  hide(): void {
    this.dom.style.display = 'none'
  }
}

export class MermaidLanguageBlock implements LanguageBlock {
  name = 'Mermaid'
  description = null
  lang = null
  alias = ['mermaidjs']
  command = ({ editor, range }: CommandProps): void => {
    editor.chain().focus().deleteRange(range).setCodeBlock({ language: 'Mermaid' }).run()
  }
  livePreviewMap: Map<string, LivePreview> = new Map()

  constructor() {
    mermaid.initialize({ startOnLoad: false, theme: 'neutral' })
  }

  updateLivePreview = (id: string, parent: HTMLElement, content: string): void => {
    let livePreview = this.livePreviewMap.get(id)
    if (!livePreview) {
      const mermaidWrapper = document.createElement('div')
      mermaidWrapper.classList.add('codeblock-preview')
      mermaidWrapper.classList.add('zoomable')
      mermaidWrapper.style.display = 'none'
      Zoomable.wrap(mermaidWrapper)
      parent.appendChild(mermaidWrapper)

      livePreview = new LivePreview(id, mermaidWrapper, parent)
      this.livePreviewMap.set(id, livePreview)
    }
    if (content === '') {
      livePreview.hide()
    } else {
      livePreview.show(content)
    }
  }

  hideLivePreview = (id: string): void => {
    const livePreview = this.livePreviewMap.get(id)
    if (livePreview) {
      livePreview.hide()
      this.livePreviewMap.delete(id)
    }
  }
}
