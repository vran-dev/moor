import { useRef, useCallback, useEffect } from 'react'
import { PreviewModal } from './PreviewModal'
import { useModal } from '@renderer/ui/Modal/useModal'
import { debounce } from 'lodash-es'
import { LanguageInfo } from '../../language'

export function CodePreview(props: {
    language: LanguageInfo
    data: string
}): JSX.Element {
    const previewContainerRef = useRef<HTMLDivElement | null>(null)
    const { language, data } = props
    const [modal, showModal] = useModal()
    const showPreviewModal = useCallback((): void => {
        if (language === null) {
            return
        }
        showModal(language.name, (onClose) => {
            return (
                <PreviewModal
                    languageInfo={language}
                    onClose={onClose}
                    codeData={data}
                />
            )
        })
    }, [language, data])

    const updatePreview = debounce(
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
