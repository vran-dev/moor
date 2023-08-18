/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { EditorThemeClasses } from 'lexical'

import './default.css'
import './defaultLight.css'

const theme: EditorThemeClasses = {
  blockCursor: 'PlaygroundEditorTheme__blockCursor',
  characterLimit: 'PlaygroundEditorTheme__characterLimit',
  code: 'PlaygroundEditorTheme__code',
  embedBlock: {
    base: 'EditorTheme__embedBlock',
    focus: 'EditorTheme__embedBlockFocus'
  },
  hashtag: 'EditorTheme__hashtag',
  heading: {
    h1: 'EditorTheme__h1',
    h2: 'EditorTheme__h2',
    h3: 'EditorTheme__h3',
    h4: 'EditorTheme__h4',
    h5: 'EditorTheme__h5',
    h6: 'EditorTheme__h6'
  },
  image: 'editor-image',
  indent: 'PlaygroundEditorTheme__indent',
  inlineImage: 'inline-editor-image',
  link: 'EditorTheme__link',
  list: {
    listitem: 'EditorTheme__listItem',
    listitemChecked: 'EditorTheme__listItemChecked',
    listitemUnchecked: 'EditorTheme__listItemUnchecked',
    nested: {
      listitem: 'EditorTheme__nestedListItem'
    },
    olDepth: [
      'EditorTheme__ol1',
      'EditorTheme__ol2',
      'EditorTheme__ol3',
      'EditorTheme__ol4',
      'EditorTheme__ol5'
    ],
    ul: 'EditorTheme__ul',
    ol: 'EditorTheme__ol'
  },
  ltr: 'PlaygroundEditorTheme__ltr',
  mark: 'PlaygroundEditorTheme__mark',
  markOverlap: 'PlaygroundEditorTheme__markOverlap',
  paragraph: 'EditorTheme__paragraph',
  quote: 'EditorTheme__quote',
  rtl: 'PlaygroundEditorTheme__rtl',
  table: 'PlaygroundEditorTheme__table',
  tableAddColumns: 'PlaygroundEditorTheme__tableAddColumns',
  tableAddRows: 'PlaygroundEditorTheme__tableAddRows',
  tableCell: 'PlaygroundEditorTheme__tableCell',
  tableCellActionButton: 'PlaygroundEditorTheme__tableCellActionButton',
  tableCellActionButtonContainer: 'PlaygroundEditorTheme__tableCellActionButtonContainer',
  tableCellEditing: 'PlaygroundEditorTheme__tableCellEditing',
  tableCellHeader: 'PlaygroundEditorTheme__tableCellHeader',
  tableCellPrimarySelected: 'PlaygroundEditorTheme__tableCellPrimarySelected',
  tableCellResizer: 'PlaygroundEditorTheme__tableCellResizer',
  tableCellSelected: 'PlaygroundEditorTheme__tableCellSelected',
  tableCellSortedIndicator: 'PlaygroundEditorTheme__tableCellSortedIndicator',
  tableResizeRuler: 'PlaygroundEditorTheme__tableCellResizeRuler',
  tableSelected: 'PlaygroundEditorTheme__tableSelected',
  tableSelection: 'PlaygroundEditorTheme__tableSelection',
  text: {
    bold: 'EditorTheme__textBold',
    code: 'EditorTheme__textCode',
    italic: 'PlaygroundEditorTheme__textItalic',
    strikethrough: 'PlaygroundEditorTheme__textStrikethrough',
    subscript: 'PlaygroundEditorTheme__textSubscript',
    superscript: 'PlaygroundEditorTheme__textSuperscript',
    underline: 'EditorTheme__textUnderline',
    underlineStrikethrough: 'PlaygroundEditorTheme__textUnderlineStrikethrough'
  }
}

export default theme
