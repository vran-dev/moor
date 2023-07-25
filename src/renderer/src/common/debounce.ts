export const debounce = (fn: (...args: any[]) => void, delay: number): (() => void) => {
  let timer: number
  return function (...args: any[]) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}
