export class SearchBoxView {
  container: HTMLElement
  input: HTMLInputElement
  countSpan: HTMLSpanElement

  constructor(container: HTMLElement, input: HTMLInputElement, countSpan: HTMLSpanElement) {
    this.container = container
    this.input = input
    this.countSpan = countSpan
  }

  show(): void {
    this.container.style.display = 'block'
    this.input.focus()
  }

  hide(): void {
    this.container.style.display = 'none'
  }

  updateTextValue(value: string): void {
    this.input.value = value ? value : ''
  }

  updateCountSpan(currentMatchIndex: number, totalMatchCount: number): void {
    if (!totalMatchCount) {
      this.countSpan.innerHTML = ''
      return
    }
    if (totalMatchCount == 0) {
      this.countSpan.innerHTML = '0/0'
      return
    }
    this.countSpan.innerHTML = `${currentMatchIndex + 1}/${totalMatchCount}`
  }
}

const searchIconSvg = `<svg
className="icon"
viewBox="0 0 1024 1024"
version="1.1"
xmlns="http://www.w3.org/2000/svg"
width="16"
height="16"
>
<path
  d="M883.2 823.466667L665.6 605.866667C704 554.666667 725.333333 492.8 725.333333 426.666667c0-164.266667-134.4-298.666667-298.666666-298.666667S128 262.4 128 426.666667s134.4 298.666667 298.666667 298.666666c66.133333 0 128-21.333333 179.2-59.733333l217.6 217.6c17.066667 17.066667 42.666667 17.066667 59.733333 0 17.066667-17.066667 17.066667-42.666667 0-59.733333zM213.333333 426.666667c0-117.333333 96-213.333333 213.333334-213.333334s213.333333 96 213.333333 213.333334-96 213.333333-213.333333 213.333333-213.333333-96-213.333334-213.333333z"
  fill="#999999"
></path>
</svg>`

export const createSearchBoxView = (
  defaultValue: string | null,
  find: (event) => void,
  escape: () => void
): SearchBoxView => {
  const wrapper = document.createElement('div')
  wrapper.classList.add('search-page-box')

  const iconContainer = document.createElement('div')
  iconContainer.classList.add('search-page-box-icon')
  iconContainer.innerHTML = searchIconSvg
  wrapper.appendChild(iconContainer)

  const input = document.createElement('input')
  input.type = 'text'
  input.classList.add('search-page-box-input')
  input.placeholder = 'Search in page'
  input.addEventListener('input', find)
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && wrapper.style.display !== 'none') {
      find(event)
    }
    if (event.key === 'Escape') {
      wrapper.style.display = 'none'
      escape()
    }
  })
  input.value = defaultValue || ''
  wrapper.appendChild(input)

  const countSpan = document.createElement('span')
  countSpan.classList.add('search-page-box-count')
  countSpan.innerText = ''
  wrapper.appendChild(countSpan)
  return new SearchBoxView(wrapper, input, countSpan)
}
