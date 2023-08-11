import data from '@emoji-mart/data'
import { init, SearchIndex } from 'emoji-mart'

let isInit = false

let defaultEmojiData = []

export interface EmojiData {
  categoryId: string
  emojis: []
}

export const getEmojis = async ({ query }: { query: string }): Promise<EmojiData[]> => {
  if (!isInit) {
    init({ data })
    defaultEmojiData = data.categories.map((category) => {
      const categoryEmojis = category.emojis.map((emoji) => {
        return data.emojis[emoji]
      })
      return {
        categoryId: category.id,
        emojis: categoryEmojis
      }
    })
    isInit = true
  }
  if (!query || query === '') {
    return defaultEmojiData
  }

  const emojis = await SearchIndex.search(query)
  return [
    {
      categoryId: 'search',
      emojis
    }
  ]
}

export const toTwoDimensional = (array: any[], columns: number): [][] => {
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
}
