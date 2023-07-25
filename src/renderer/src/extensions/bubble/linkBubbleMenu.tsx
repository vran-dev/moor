import { Editor } from '@tiptap/react'

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const LinkBubbleMenu = ({
  editor,
  onClick,
  isActive
}: {
  editor: Editor
  onClick: (e) => void
  isActive: boolean
}) => {
  return (
    <div>
      <button
        className="link-menu"
        onClick={(e) => {
          onClick(e)
        }}
      >
        <p className="text">↗</p>
        <p className={isActive ? 'active' : ''}>Link</p>
      </button>
    </div>
  )
}
