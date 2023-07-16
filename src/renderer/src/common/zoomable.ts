export default class Zoomable {
  static #overlay: HTMLDivElement

  static {
    this.#overlay = document.createElement('div')
    this.#overlay.style.position = 'fixed'
    this.#overlay.style.top = '0'
    this.#overlay.style.left = '0'
    this.#overlay.style.width = '100%'
    this.#overlay.style.height = '100%'
    this.#overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
    this.#overlay.style.zIndex = '9999'
    this.#overlay.style.margin = '0 auto'
    this.#overlay.style.display = 'none'
    document.body.appendChild(this.#overlay)
  }

  static init(element: HTMLElement): void {
    element.addEventListener('click', function () {
      const zoomedElement = element.cloneNode(true)
      zoomedElement.style.display = 'flex'
      zoomedElement.style.justifyContent = 'center'
      zoomedElement.style.position = 'absolute'
      zoomedElement.style.top = '10%'
      zoomedElement.style.left = '10%'
      zoomedElement.style.height = '80%'
      zoomedElement.style.width = '80%'
      zoomedElement.style.zIndex = '10000'

      const listener = (): void => {
        Zoomable.#overlay.removeChild(zoomedElement)
        Zoomable.#overlay.style.display = 'none'
        Zoomable.#overlay.removeEventListener('click', listener)
      }

      Zoomable.#overlay.style.display = 'inherit'
      Zoomable.#overlay.appendChild(zoomedElement)
      Zoomable.#overlay.addEventListener('click', listener)
    })
  }
}
