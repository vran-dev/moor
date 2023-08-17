import { useRef, useCallback, useEffect } from 'react'
import { LanguageInfo } from '../../CodeMirrorLanguages'
import { PreviewModal } from './PreviewModal'
import useModal from '@renderer/ui/Modal/useModal'

export function CodeblockPreview(props: { language: LanguageInfo; data: string }): JSX.Element {
  const previewContainerRef = useRef<HTMLDivElement | null>(null)
  const { language, data } = props
  const [modal, showModal] = useModal()
  const showPreviewModal = useCallback((): void => {
    if (language === null) {
      return
    }
    showModal(language.name, (onClose) => {
      return <PreviewModal languageInfo={language} onClose={onClose} codeData={data} />
    })
  }, [language, data])

  useEffect(() => {
    if (!previewContainerRef || !previewContainerRef.current) {
      return
    }
    if (language && language.preview) {
      language.preview(data, previewContainerRef.current)
    }
  }, [language, data])
  return (
    <>
      <div
        className="codeblock-preview"
        ref={previewContainerRef}
        onClick={(): void => showPreviewModal()}
      ></div>
      {modal}
    </>
  )
}
