export class ResizeableHolder {
  container: HTMLElement
  resizeableElement: HTMLElement
  leftSide: HTMLElement
  rightSide: HTMLElement
  width: string | number | null
  height: string | number | null
  onResize: (width: string, height: string) => void
  private minWidth = 36
  private initialX: number | undefined
  private initialY: number | undefined
  private aspectRatio: number | undefined

  constructor(
    element: HTMLElement,
    onResize: (width: string, height: string) => void,
    width: string | number | null,
    height: string | number | null
  ) {
    this.onResize = onResize
    this.width = width
    this.height = height
    this.resizeableElement = element
    const resizeableContainer = document.createElement('div')
    this.container = resizeableContainer

    resizeableContainer.style.position = 'relative'
    resizeableContainer.classList.add('image-container') // todo delete
    if (width) {
      resizeableContainer.style.width = width
    } else {
      resizeableContainer.style.width = 'auto'
    }
    if (height) {
      resizeableContainer.style.height = height
    } else {
      resizeableContainer.style.height = 'auto'
    }
    resizeableContainer.appendChild(element)

    this.leftSide = document.createElement('div')
    this.leftSide.addEventListener('mousedown', (event) => {
      event.preventDefault()
      this.leftSide.classList.add('resizing')
      this.handleMouseDown(event)
    })
    resizeableContainer.appendChild(this.leftSide)

    this.rightSide = document.createElement('div')
    this.rightSide.addEventListener('mousedown', (event) => {
      event.preventDefault()
      this.rightSide.classList.add('resizing')
      this.handleMouseDown(event)
    })
    resizeableContainer.appendChild(this.rightSide)

    resizeableContainer.addEventListener('mouseenter', (event) => {
      event.preventDefault()
      this.leftSide.classList.add('resize-handle', 'resize-handle-left')
      this.rightSide.classList.add('resize-handle', 'resize-handle-right')
    })
    resizeableContainer.addEventListener('mouseleave', (event) => {
      event.preventDefault()
      this.leftSide.classList.remove('resize-handle', 'resize-handle-left')
      this.rightSide.classList.remove('resize-handle', 'resize-handle-right')
    })

    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp)
  }

  destroy(): void {
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)
  }

  private handleMouseDown = (event: MouseEvent): void => {
    event.preventDefault()
    this.initialX = event.clientX
    this.initialY = event.clientY
    this.initAspectRatio()
  }

  private handleMouseUp = (event: MouseEvent): void => {
    if (
      this.rightSide.classList.contains('resizing') ||
      this.leftSide.classList.contains('resizing')
    ) {
      event.preventDefault()
      this.rightSide.classList.remove('resizing')
      this.leftSide.classList.remove('resizing')
      this.onResize(this.width, this.height)
    }
  }

  private handleMouseMove = (event: MouseEvent): void => {
    let element: HTMLElement
    if (this.leftSide.classList.contains('resizing')) {
      element = this.leftSide
    } else if (this.rightSide.classList.contains('resizing')) {
      element = this.rightSide
    } else {
      return
    }
    event.preventDefault()
    let deltaX: number
    if (element == this.leftSide) {
      deltaX = -(event.clientX - this.initialX)
    } else {
      deltaX = event.clientX - this.initialX
    }
    this.initialX = event.clientX
    this.initialY = event.clientY
    const newWidth = this.container.offsetWidth + deltaX
    if (newWidth < this.minWidth) {
      return
    }
    const newHeight = newWidth / this.aspectRatio
    this.container.style.width = `${newWidth}px`
    this.container.style.height = `${newHeight}px`
    this.height = `${newHeight}px`
    this.width = `${newWidth}px`
  }

  private initAspectRatio(): void {
    let domHeight: number
    if (this.container.offsetHeight > 0) {
      domHeight = this.container.offsetHeight
    } else {
      domHeight = 1
    }
    this.aspectRatio = this.container.offsetWidth / domHeight
  }
}

export default class Resizeable {
  static wrap(
    element: HTMLElement,
    onResize: (width: string, height: string) => void,
    width: string | number,
    height: string | number
  ): ResizeableHolder {
    return new ResizeableHolder(element, onResize, width, height)
  }
}
