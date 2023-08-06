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
    <button
      className="bubble-menu-item link-menu"
      onClick={(e) => {
        onClick(e)
      }}
    >
      <div className="text">↗</div>
      <div className={isActive ? 'active' : ''}>Link</div>
    </button>
  )
}
