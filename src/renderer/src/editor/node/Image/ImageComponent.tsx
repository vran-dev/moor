import { useDebounce } from '@renderer/editor/utils/useDebounce'
import { ResizableRatioType, ResizableView } from '@renderer/ui/ResizableView'
import { useRef } from 'react'
import { $isImageNode, ImageNode } from '.'
import { $getNodeByKey, ElementFormatType, NodeKey } from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ImageUploader } from './components/ImageUploader'
import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents'

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
  const { src, altText, width, height, nodeKey } = props
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

  const srcExists = src && src.length > 0
  return (
    <BlockWithAlignableContents className={props.className} format={props.format} nodeKey={nodeKey}>
      {!srcExists ? (
        <ImageUploader nodeKey={nodeKey}></ImageUploader>
      ) : (
        <ResizableView
          aspectRatio={ResizableRatioType.Fixed}
          initialSize={{ width: width, height: height }}
          onResized={(e, newWidth, newHeight): void => {
            withImageNode((node: ImageNode) => node.setWidthAndHeight(newWidth, newHeight))
          }}
        >
          <img
            src={src}
            alt={altText}
            ref={imageRef}
            draggable="true"
            style={{ width: '100%', height: '100%' }}
          />
        </ResizableView>
      )}
    </BlockWithAlignableContents>
  )
}
