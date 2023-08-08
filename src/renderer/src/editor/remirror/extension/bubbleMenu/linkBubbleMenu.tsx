/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const LinkBubbleMenu = ({
  onClick,
  isActive
}: {
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
