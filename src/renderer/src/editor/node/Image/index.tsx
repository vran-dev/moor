/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  Spread
} from 'lexical'

import { $applyNodeReplacement } from 'lexical'
import * as React from 'react'

import { ImageComponent } from './ImageComponent'
import {
  DecoratorBlockNode,
  SerializedDecoratorBlockNode
} from '@lexical/react/LexicalDecoratorBlockNode'

export interface ImagePayload {
  altText?: string
  height?: number
  format?: ElementFormatType
  key?: NodeKey
  src?: string
  width?: number
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src, width, height } = domNode
    const node = $createImageNode({ altText, height, src, width })
    return { node }
  }
  return null
}

export type SerializedImageNode = Spread<
  {
    altText: string
    height?: number
    src: string
    width?: number
  },
  SerializedDecoratorBlockNode
>

export class ImageNode extends DecoratorBlockNode {
  __src?: string
  __altText?: string
  __width?: number
  __height?: number | undefined
  static getType(): string {
    return 'image'
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__format,
      node.__key
    )
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { altText, height, width, src } = serializedNode
    const node = $createImageNode({
      altText,
      height,
      src,
      width
    })
    return node
  }

  exportDOM(): DOMExportOutput {
    if (this.__src && isSvg(this.__src)) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(this.__src, 'image/svg+xml')
      const svgElement = doc.documentElement
      const htmlElement = document.createElementNS('http://www.w3.org/1999/xhtml', 'div')
      htmlElement.appendChild(svgElement)
      return {
        element: htmlElement
      }
    } else {
      const element = document.createElement('img')
      element.setAttribute('src', this.__src || '')
      element.setAttribute('alt', this.__altText || '')
      element.setAttribute('width', this.__width?.toString() || '')
      element.setAttribute('height', this.__height ? this.__height.toString() : '')
      return { element }
    }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => ({
        conversion: convertImageElement,
        priority: 0
      })
    }
  }

  constructor(
    src?: string,
    altText?: string,
    width?: number,
    height?: number,
    format?: ElementFormatType,
    key?: NodeKey
  ) {
    super(format, key)
    this.__src = src
    this.__altText = altText
    this.__width = width
    this.__height = height
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      altText: this.getAltText(),
      height: this.__height,
      src: this.getSrc(),
      type: 'image',
      version: 1,
      width: this.__width
    }
  }

  setWidthAndHeight(width: number, height: number): void {
    const writable = this.getWritable()
    writable.__width = width
    writable.__height = height
  }

  setSrc(src: string): void {
    const writable = this.getWritable()
    writable.__src = src
  }

  updateDOM(): false {
    return false
  }

  getSrc(): string {
    return this.__src
  }

  getAltText(): string {
    return this.__altText
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock || {}
    const className = {
      base: embedBlockTheme.base || '',
      focus: embedBlockTheme.focus || ''
    }
    return (
      <ImageComponent
        src={this.__src}
        altText={this.__altText || ''}
        width={this.__width}
        height={this.__height}
        nodeKey={this.getKey()}
        className={className}
        format={this.__format}
      />
    )
  }
}

export function $createImageNode(options?: ImagePayload): ImageNode {
  const { altText, height, key, format, src, width } = options || {}
  return $applyNodeReplacement(new ImageNode(src, altText, width, height, format, key))
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode
}

export function isSvg(src: string | undefined): boolean {
  if (!src) {
    return false
  }
  // use regex to check if the src is a svg
  const svgTagRegex = /^<svg\b[^>]*>.*<\/svg>$/i
  return svgTagRegex.test(src)
}
