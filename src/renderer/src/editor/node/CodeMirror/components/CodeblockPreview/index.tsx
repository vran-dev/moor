import { useRef, useCallback, useEffect } from 'react'
import { LanguageInfo } from '../../languages'
import { PreviewModal } from './PreviewModal'
import useModal from '@renderer/ui/Modal/useModal'
import { useDebounce } from '@renderer/editor/utils/useDebounce'

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

  const updatePreview = useDebounce(
    (language: LanguageInfo): void => {
      if (!previewContainerRef || !previewContainerRef.current) {
        return
      }
      if (language && language.preview) {
        language.preview(data, previewContainerRef.current)
      }
    },
    50,
    1000
  )

  useEffect(() => {
    updatePreview(language)
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
