import { useLayoutEffect, useRef } from 'react'
import { LanguageInfo } from './CodeMirrorLanguages'

export function CodePreviewComponent(props: {
  languageInfo: LanguageInfo
  codeData: string
  onClose: () => void
}): JSX.Element {
  const previewContentModal = useRef<HTMLDivElement | null>(null)
  const { languageInfo, codeData } = props
  useLayoutEffect(() => {
    console.log('use layout')
    if (!previewContentModal.current) {
      return
    }
    console.log('create preview...', languageInfo, languageInfo.preview)
    if (languageInfo && languageInfo.preview) {
      languageInfo.preview(codeData, previewContentModal.current)
      console.log('create view')
    }
  }, [])
  return (
    <div className="codeblock-preview-modal">
      <div className="codeblock-preview-modal-content" ref={previewContentModal}></div>
    </div>
  )
}
