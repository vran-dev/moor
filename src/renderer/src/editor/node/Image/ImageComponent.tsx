import { useDebounce } from '@renderer/editor/utils/useDebounce'
import { ResizableRatioType, ResizableView } from '@renderer/ui/ResizableView'
import { useRef } from 'react'
import { $isImageNode, ImageNode } from '.'
import { $getNodeByKey, NodeKey } from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'

export function ImageComponent(props: {
  src: string
  altText: string
  width: number
  height?: number
  nodeKey: NodeKey
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
  return (
    <div>
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
          draggable="false"
          style={{ width: '100%', height: '100%' }}
        />
      </ResizableView>
    </div>
  )
}
