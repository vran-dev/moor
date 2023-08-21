import mermaid from 'mermaid'
import { LanguageInfo } from '.'
import { useLayoutEffect, useRef } from 'react'

export class MermaidLanguageInfo implements LanguageInfo {
  name = 'Mermaid'
  alias = ['sequence', 'flowchart', 'mindmap', 'pie', 'state', 'diagram']
  description =
    'It is a JavaScript based diagramming and charting tool that renders Markdown-inspired text definitions to create and modify diagrams dynamically.'
  codeMirrorLanguage = null

  constructor() {
    mermaid.initialize({ startOnLoad: false, theme: 'default' })
  }

  preview = (codeData: string, parent: HTMLElement): void => {
    if (parent.attributes.getNamedItem('data-processed')) {
      parent.attributes.removeNamedItem('data-processed')
    }
    parent.innerHTML = codeData
    mermaid
      .run({
        nodes: [parent]
      })
      .then(() => {
        // render success
      })
      .catch((error) => {
        // this.dom.style.display = 'none'
        console.debug('render mermaid failed', error)
      })
  }
}
