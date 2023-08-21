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
import { useDecoratorNodeKeySetting } from '@renderer/editor/utils/useDecoratorNodeKeySetting'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { useCover } from '@renderer/ui/Cover/useCover'

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
  useDecoratorNodeKeySetting({
    nodeKey: nodeKey,
    editor: editor,
    focus: (): boolean => {
      if (imageRef.current) {
        setSelected(true)
        return true
      }
      return false
    }
  })
  const [cover, showCover, hideCover] = useCover()
  useEffect(() => {
    if (selected) {
      console.log('show')
      showCover()
    } else {
      hideCover()
    }
  }, [selected, showCover, hideCover])
  const srcExists = src && src.length > 0
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
          <img
            ref={imageRef}
            src={src}
            alt={altText}
            draggable="true"
            className={`${selected ? 'image-content' : ''}`}
            style={{ width: '100%', height: '100%' }}
          />
          {cover}
        </ResizableView>
      )}
    </BlockWithAlignableContents>
  )
}
