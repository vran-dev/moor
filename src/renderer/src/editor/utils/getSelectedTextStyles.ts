export interface TextSelectionStyle {
  backgroundColor: string
  color: string
}

export function getSelectedTextStyles(): TextSelectionStyle | null {
  const selection = window.getSelection()
  if (selection != null && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    const computedStyle = window.getComputedStyle(range.commonAncestorContainer.parentElement)

    const backgroundColor = computedStyle.backgroundColor
    const color = computedStyle.color

    return {
      backgroundColor: backgroundColor,
      color: color
    }
  }

  return null
}
