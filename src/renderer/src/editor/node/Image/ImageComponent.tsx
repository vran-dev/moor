import { useDebounce } from '@renderer/editor/utils/useDebounce'
import { ResizableRatioType, ResizableView } from '@renderer/ui/ResizableView'
import { useEffect, useRef } from 'react'
import { $isImageNode, ImageNode } from '.'
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
import { useDecoratorNodeArrowMove } from '@renderer/editor/utils/useDecoratorNodeArrowMove'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'

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

  const [selected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)
  useDecoratorNodeArrowMove({
    editor: editor,
    predicate: (node) => $isImageNode(node),
    focus: (): boolean => {
      if (imageRef.current) {
        setSelected(true)
        return true
      }
      return false
    }
  })
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
            draggable="true"
            className={`${selected ? 'image-content' : ''}`}
            style={{ width: '100%', height: '100%' }}
          />
        </ResizableView>
      )}
    </BlockWithAlignableContents>
  )
}
