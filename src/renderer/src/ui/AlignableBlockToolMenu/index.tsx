import { LexicalEditor, NodeKey, ElementFormatType, $getNodeByKey } from 'lexical'
import { useCallback } from 'react'
import { BsTrash3 } from 'react-icons/bs'
import { Button } from '../Button'
import { Divider } from '../Divider'
import { VirtualSelect } from '../Select'
import { AiOutlinePicCenter, AiOutlinePicLeft, AiOutlinePicRight } from 'react-icons/ai'
import { $isDecoratorBlockNode, DecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode'
import './index.css'
import { size } from '@floating-ui/react'

export function AlignableBlockToolMenu(props: {
  editor: LexicalEditor
  nodeKey: NodeKey
  nodeFormat: ElementFormatType
  children?: React.ReactNode
}): JSX.Element {
  const { editor, nodeKey, nodeFormat, children } = props
  const withDecoratorBlockNode = (
    callback: (node: DecoratorBlockNode) => void,
    onUpdate?: () => void
  ): void => {
    editor.update(
      () => {
        const node = $getNodeByKey(nodeKey)
        if ($isDecoratorBlockNode(node)) {
          callback(node)
        }
      },
      { onUpdate }
    )
  }

  const removeNode = useCallback(() => {
    withDecoratorBlockNode((node) => {
      node.remove()
    })
  }, [nodeKey])

  const layoutSelectItems = [
    {
      icon: <AiOutlinePicLeft />,
      name: 'start',
      value: 'start',
      onSelect: () =>
        withDecoratorBlockNode((node: DecoratorBlockNode) => {
          node.setFormat('start')
        })
    },
    {
      icon: <AiOutlinePicCenter />,
      name: 'center',
      value: 'center',
      onSelect: () =>
        withDecoratorBlockNode((node: DecoratorBlockNode) => {
          node.setFormat('center')
        })
    },
    {
      icon: <AiOutlinePicRight />,
      name: 'end',
      value: 'end',
      onSelect: () =>
        withDecoratorBlockNode((node: DecoratorBlockNode) => {
          node.setFormat('end')
        })
    }
  ]

  const getMenuJustifyContentByFormat = (): string => {
    if (nodeFormat === 'right' || nodeFormat === 'end') {
      return 'end'
    }
    if (nodeFormat === 'center') {
      return 'center'
    }
    return 'start'
  }
  const defaultLayoutActiveIndex = layoutSelectItems.findIndex((b) => b.value === nodeFormat)

  return (
    <div
      className="alignable-block-tool-menu"
      style={{
        justifyContent: getMenuJustifyContentByFormat()
      }}
    >
      {children}
      <VirtualSelect
        options={layoutSelectItems}
        defaultIndex={defaultLayoutActiveIndex < 0 ? 0 : defaultLayoutActiveIndex}
        onSelect={(option): void => option.onSelect?.()}
        className="layout-select"
        theme="dark"
        mainMinWidth="90px"
        headerOptions={{
          showName: false
        }}
      />
      <Divider direction="vertical"></Divider>
      <Button onClick={(): void => removeNode()} icon={<BsTrash3 size={12} />} type="dark"></Button>
      {/* TODO support save snapshot time */}
      {/* <Button onClick={() => {}}>Snapshot</Button> */}
    </div>
  )
}
