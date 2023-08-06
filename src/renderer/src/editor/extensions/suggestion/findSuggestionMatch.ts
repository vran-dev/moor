import { escapeForRegEx, Range } from '@tiptap/core'
import { ResolvedPos } from '@tiptap/pm/model'
import { regex } from 'uuidv4'

export interface Trigger {
  char: string
  allowSpaces: boolean
  allowedPrefixes: string[] | null
  startOfLine: boolean
  from: number
  $position: ResolvedPos
}

export type SuggestionMatch = {
  range: Range
  query: string
  text: string
} | null

export function findSuggestionMatch(config: Trigger): SuggestionMatch {
  const { char, allowSpaces, allowedPrefixes, startOfLine, from, $position } = config

  const escapedChar = escapeForRegEx(char)
  const suffix = new RegExp(`\\s${escapedChar}$`)
  const prefix = startOfLine ? '^' : ''
  const regexp = allowSpaces
    ? new RegExp(`${prefix}${escapedChar}.*?(?=\\s${escapedChar}|$)`, 'gm')
    : new RegExp(`${prefix}(?:^)?${escapedChar}[^\\s${escapedChar}]*`, 'gm')

  const nodeText = $position.nodeBefore?.isText && $position.nodeBefore.text
  if (!nodeText) {
    return null
  }

  const nodeTextLength = nodeText.length
  const newInputTextLength = $position.pos - from
  const inputTextStart = Math.max(0, nodeTextLength - newInputTextLength)
  const inputText = nodeText.slice(inputTextStart)

  const textFrom = $position.pos - inputText.length
  const match = Array.from(inputText.matchAll(regexp)).pop()
  if (!match || match.input === undefined || match.index === undefined) {
    return null
  }

  // JavaScript doesn't have lookbehinds. This hacks a check that first character
  // is a space or the start of the line
  // const matchPrefix = match.input.slice(Math.max(0, match.index - 1), match.index)
  // const matchPrefixIsAllowed = new RegExp(`^[${allowedPrefixes?.join('')}]?$`).test(matchPrefix)

  // if (allowedPrefixes !== null && !matchPrefixIsAllowed) {
  //   return null
  // }

  // The absolute position of the match in the document
  const matchFrom = textFrom + match.index
  let to = matchFrom + match[0].length

  // console.log(
  //   'from',
  //   from,
  //   'to',
  //   to,
  //   'text',
  //   nodeText,
  //   'inputText',
  //   inputText,
  //   'match',
  //   match.index
  // )

  // Edge case handling; if spaces are allowed and we're directly in between
  // two triggers
  if (allowSpaces && suffix.test(inputText.slice(to - 1, to + 1))) {
    match[0] += ' '
    to += 1
  }

  const matchedTextLength = to - matchFrom
  // If the $position is located within the matched substring, return that range
  if (matchFrom < $position.pos && (to >= $position.pos || matchedTextLength === match[0].length)) {
    return {
      range: {
        from: matchFrom,
        to: $position.pos
      },
      query: match[0].slice(char.length),
      text: match[0]
    }
  }
  return null
}
