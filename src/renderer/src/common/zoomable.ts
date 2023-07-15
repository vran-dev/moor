export default class Zoomable {
  static init(element: HTMLElement): void {
    const overlay = document.createElement('div')
    overlay.style.position = 'fixed'
    overlay.style.top = '0'
    overlay.style.left = '0'
    overlay.style.width = '100%'
    overlay.style.height = '100%'
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
    overlay.style.zIndex = '9999'
    overlay.style.margin = '0 auto'
    element.addEventListener('click', function () {
      overlay.style.display = 'inherit'
      const zoomedElement = element.cloneNode(true)
      zoomedElement.style.display = 'flex'
      zoomedElement.style.justifyContent = 'center'
      zoomedElement.style.position = 'absolute'
      zoomedElement.style.top = '10%'
      zoomedElement.style.left = '10%'
      zoomedElement.style.height = '80%'
      zoomedElement.style.width = '80%'
      zoomedElement.style.zIndex = '10000'
      overlay.style.margin = '0 auto'

      overlay.appendChild(zoomedElement)
      document.body.appendChild(overlay)
      overlay.addEventListener('click', function () {
        overlay.removeChild(zoomedElement)
        overlay.style.display = 'none'
      })
    })
  }
}
