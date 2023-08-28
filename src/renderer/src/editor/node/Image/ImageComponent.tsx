import { useDebounce } from '@renderer/editor/utils/useDebounce'
import { ResizableRatioType, ResizableView } from '@renderer/ui/ResizableView'
import { useEffect, useRef, useState } from 'react'
import { $isImageNode, ImageNode, isSvg } from '.'
import {
  $getNodeByKey,
  COMMAND_PRIORITY_HIGH,
  ElementFormatType,
  NodeKey,
  SELECTION_CHANGE_COMMAND
} from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ImageUploader } from './components/ImageUploader'
import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents'
import { useDecoratorNodeKeySetting } from '@renderer/editor/utils/useDecoratorNodeKeySetting'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { useCover } from '@renderer/ui/Cover/useCover'
import { useFloating, offset, useHover, useDismiss, useInteractions } from '@floating-ui/react'
import { AlignableBlockToolMenu } from '@renderer/ui/AlignableBlockToolMenu'
import { Button } from '@renderer/ui/Button'
import { AiOutlineZoomIn } from 'react-icons/ai'
import { useZoomablePreview } from '@renderer/ui/ZoomView'

export function ImageComponent(props: {
  src?: string | null
  altText: string
  width?: number
  height?: number
  nodeKey: NodeKey
  className: {
    base: string
    focus: string
  }
  format?: ElementFormatType
}): JSX.Element {
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [editor] = useLexicalComposerContext()
  const { src, altText, width, height, nodeKey, format } = props
  const withImageNode = useDebounce(
    (callback: (node: ImageNode) => void, onUpdate?: () => void): void => {
      editor.update(
        () => {
          const node = $getNodeByKey(nodeKey)
          if ($isImageNode(node)) {
            callback(node)
          }
        },
        { onUpdate }
      )
    },
    50,
    1000
  )

  const [selected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)
  useDecoratorNodeKeySetting({
    nodeKey: nodeKey,
    editor: editor,
    onSelect: (): boolean => {
      setSelected(true)
      return true
    }
  })
  const [showToollMenu, setShowTollMenu] = useState(false)
  const { refs, floatingStyles, context } = useFloating({
    open: showToollMenu,
    onOpenChange: setShowTollMenu,
    placement: 'top-end',
    middleware: [offset(-35)]
  })
  const hover = useHover(context, {
    move: false
  })
  const dismiss = useDismiss(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, dismiss])

  const [cover, showCover, hideCover] = useCover()
  useEffect(() => {
    if (selected) {
      showCover()
    } else {
      hideCover()
    }
  }, [selected, showCover, hideCover])
  const srcExists = src && src.length > 0

  const [previewModal, showPreviewModal, fitScreen] = useZoomablePreview()
  return (
    <BlockWithAlignableContents className={props.className} format={props.format} nodeKey={nodeKey}>
      {!srcExists ? (
        <div style={{ position: 'relative' }}>
          <ImageUploader nodeKey={nodeKey}></ImageUploader>
          {cover}
        </div>
      ) : (
        <ResizableView
          aspectRatio={ResizableRatioType.Fixed}
          initialSize={{ width: width, height: height }}
          onResized={(e, newWidth, newHeight): void => {
            withImageNode((node: ImageNode) => node.setWidthAndHeight(newWidth, newHeight))
          }}
        >
          <div ref={refs.setReference} {...getReferenceProps()}>
            {showToollMenu && (
              <div
                ref={refs.setFloating}
                style={{
                  zIndex: 9999,
                  ...floatingStyles
                }}
                {...getFloatingProps()}
              >
                <AlignableBlockToolMenu editor={editor} nodeKey={nodeKey} nodeFormat={format}>
                  <Button
                    icon={<AiOutlineZoomIn size={12} />}
                    type="dark"
                    onClick={() => {
                      showPreviewModal((): JSX.Element => {
                        return (
                          <>
                            {isSvg(src) ? (
                              <div
                                onLoad={fitScreen}
                                dangerouslySetInnerHTML={{ __html: src }}
                                style={{ maxWidth: '100%', maxHeight: '100%' }}
                              />
                            ) : (
                              <img
                                src={src}
                                alt={altText}
                                draggable="true"
                                onLoad={fitScreen}
                                className={`${selected ? 'image-content' : ''}`}
                                style={{ maxWidth: '100%', maxHeight: '100%' }}
                              />
                            )}
                          </>
                        )
                      })
                    }}
                  ></Button>
                </AlignableBlockToolMenu>
              </div>
            )}
            {isSvg(src) ? (
              <SvgNode svgString={src}></SvgNode>
            ) : (
              <img
                ref={imageRef}
                src={src}
                alt={altText}
                draggable="true"
                className={`${selected ? 'image-content' : ''}`}
                style={{ width: '100%', height: '100%' }}
              />
            )}
          </div>
          {cover}
        </ResizableView>
      )}
      {previewModal}
    </BlockWithAlignableContents>
  )
}

const SvgNode = ({ svgString }) => {
  return <div dangerouslySetInnerHTML={{ __html: svgString }} />
}
