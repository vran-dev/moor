export default class Zoomable {
  static init(element: HTMLElement): void {
    element.addEventListener('click', function () {
      console.log('clicked')
      const overlay = document.createElement('div')
      overlay.style.position = 'fixed'
      overlay.style.top = '0'
      overlay.style.left = '0'
      overlay.style.width = '100%'
      overlay.style.height = '100%'
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
      overlay.style.zIndex = '9999'

      const zoomedElement = element.cloneNode(true)
      zoomedElement.style.position = 'absolute'
      zoomedElement.style.top = '50%'
      zoomedElement.style.left = '50%'
      zoomedElement.style.transform = 'translate(-50%, -50%)'
      zoomedElement.style.maxWidth = '90%'
      zoomedElement.style.maxHeight = '90%'
      zoomedElement.style.zIndex = '10000'

      overlay.appendChild(zoomedElement)
      document.body.appendChild(overlay)

      overlay.addEventListener('click', function () {
        document.body.removeChild(overlay)
      })
    })
  }
}
