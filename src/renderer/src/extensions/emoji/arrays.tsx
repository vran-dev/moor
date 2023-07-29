export const toTwoDimensional = (array: any[], columns: number) => {
  const result = []
  let row = 0
  while (true) {
    const start = row * columns
    const end = start + columns
    const items = array.slice(start, end)
    if (items.length == 0) {
      return result
    }
    result.push(items)
    row++
    if (items.length < columns) {
      return result
    }
  }
  return result
}
