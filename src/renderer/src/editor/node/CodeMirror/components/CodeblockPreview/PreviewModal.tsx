import { useLayoutEffect, useRef } from 'react'
import { LanguageInfo } from '../../CodeMirrorLanguages'

export function PreviewModal(props: {
  languageInfo: LanguageInfo
  codeData: string
  onClose: () => void
}): JSX.Element {
  const previewContentModal = useRef<HTMLDivElement | null>(null)
  const { languageInfo, codeData } = props
  useLayoutEffect(() => {
    if (!previewContentModal.current) {
      return
    }
    if (languageInfo && languageInfo.preview) {
      languageInfo.preview(codeData, previewContentModal.current)
    }
  }, [])
  return <div className="codeblock-preview-modal" ref={previewContentModal}></div>
}
