/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  HEADING,
  QUOTE,
  CODE,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
  Transformer
} from '@lexical/markdown'
import { CHECK_LIST, ORDERED_LIST, UNORDERED_LIST } from './List'

export const MARKDOWN_TRANSFORMERS: Array<Transformer> = [
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
  HEADING,
  QUOTE,
  CODE,
  ORDERED_LIST,
  UNORDERED_LIST,
  CHECK_LIST
]
