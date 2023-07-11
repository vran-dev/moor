import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { CustomLink } from '../extensions/link'
import CustomImage from '../extensions/image/image'
import CustomTable from '../extensions/table'
import { CustomCodeBlock } from '@renderer/extensions/codeblock/codeBlock'
import ExcalidrawNode from '@renderer/extensions/excalidraw/excalidraw'
import { MermaidNode } from '@renderer/extensions/mermaid/mermaid'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import React, { useEffect } from 'react'
import Slash from '@renderer/extensions/slash'

import {
  BoldIcon,
  ItalicIcon,
  LinkIcon,
  CodeIcon,
  StrikethroughIcon,
  UnderlineIcon,
  QuoteIcon
} from './Icons'

const Tiptap = (): JSX.Element => {
  const content = `
                <p>在 API 开发或对接中，经常会看到协议中有自定义 code 的设计</p>
<ul>
<li>那为什么要这么设计呢？</li>
<li>这种设计有没有什么实践？</li>
<li>大厂都是怎么做的呢？</li>
</ul>

<div class="mermaid" ></div>

<p>跟随本文，一起揭晓以上问题</p>
<ul data-type="taskList">
          <li data-type="taskItem" data-checked="true">A list item</li>
          <li data-type="taskItem" data-checked="false">And another one</li>
        </ul>
        <div class="excalidraw"></div> 
<h2 id="为什么还要自定义-code">为什么还要自定义 code？</h2>

<img src="https://blog.cc1234.cc/posts/http-status-and-code/img/1.png" />

<p>HTTP 协议中定义了 5 类 status code</p>
<ol>
<li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#information_responses">Informational responses</a>(<code>100</code>–<code>199</code>)</li>
<li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#successful_responses">Successful responses</a>(<code>200</code>–<code>299</code>)</li>
<li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#redirection_messages">Redirection messages</a>(<code>300</code>–<code>399</code>)</li>
<li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses">Client error responses</a>(<code>400</code>–<code>499</code>)</li>
<li><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#server_error_responses">Server error responses</a>(<code>500</code>–<code>599</code>)</li>
</ol>
<p>这其中留给开发者可以用的 status code 少之又少，而实际的业务响应又会有非常多的状态，所以开发者需要一种方式来扩展 code。</p>
<p>这其中最直观的方式就是定义一个标准的响应结构，这个结构中有着一个自定义的 <code>code</code> 字段，它可以用来表示业务的响应状态，如下：</p>
<div class="highlight"><pre tabindex="0" style="background-color:#fff;-moz-tab-size:4;-o-tab-size:4;tab-size:4;"><code class="language-json" data-lang="json"><span style="display:flex;"><span>{
</span></span><span style="display:flex;"><span>    <span style="color:#000">"code"</span>:<span style="color:#c41a16">"A1000"</span>,
</span></span><span style="display:flex;"><span>    <span style="color:#000">"message"</span>:<span style="color:#c41a16">"会员已过期"</span>
</span></span><span style="display:flex;"><span>}
</span></span></code></pre></div><p>所以，<strong>自定义 code 本质上是对 status code 的一个扩展，是为了满足实际业务中复杂的状态表达而设计的。</strong></p>
<h2 id="自定义-code-该怎么用">自定义 code 该怎么用？</h2>
<p>HTTP 的 status 不够用导致我们设计了自定义 code，但现在很多 API 的 code 都已经被滥用了。</p>
<p>我推荐的做法是：按语义将  HTTP status 当作一级分类，自定义 code 当作二级分类</p>
<ul>
<li>2xx  请求成功</li>
<li>4xx 客户端错误，不影响服务可用性</li>
<li>5xx 服务端错误，影响服务可用性</li>
</ul>
<img src="https://blog.cc1234.cc/posts/http-status-and-code/img/1.png" alt="Untitled"></p>
<p>2xx 代表成功，实际业务场景下很少会碰到成功之下还要再区分不同的成功状态的，即使遇到了，设计一个更符合业务语义的字段通常也会更好。</p>
<p>所以， 2xx 的响应没必要设置自定义 code</p>
<p><img src="https://blog.cc1234.cc/posts/http-status-and-code/img/2.png" alt="Untitled"></p>
<p>而 4xx、5xx 这种错误响应之下再做错误细分的场景是很常见的，比如 4xx 客户端错误之下需要明确具体的业务错误：支付时用户余额不足、商品库存不足、支付超时等。</p>
<p><img src="img/3.png" alt="Untitled"></p>
<p>现在明确了只为 4xx、5xx 扩展 code，而 code 又是由响应体来承载的，接下来就看看如何设计错误响应体。</p>
<h2 id="错误响应体怎么设计">错误响应体怎么设计?</h2>
<p>先来看看微软在它的 <a href="https://github.com/microsoft/api-guidelines">REST API guidlines</a> 里的设计</p>
<blockquote>
<p><a href="https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md#errorresponse--object">https://github.com/microsoft/api-guidelines/blob/vNext/Guidelines.md#errorresponse–object</a></p>
</blockquote>
<div class="highlight"><pre tabindex="0" style="background-color:#fff;-moz-tab-size:4;-o-tab-size:4;tab-size:4;"><code class="language-json" data-lang="json"><span style="display:flex;"><span>{
</span></span><span style="display:flex;"><span>  <span style="color:#000">"error"</span>: {
</span></span><span style="display:flex;"><span>    <span style="color:#000">"code"</span>: <span style="color:#c41a16">"BadArgument"</span>,
</span></span><span style="display:flex;"><span>    <span style="color:#000">"message"</span>: <span style="color:#c41a16">"Multiple errors in ContactInfo data"</span>,
</span></span><span style="display:flex;"><span>    <span style="color:#000">"target"</span>: <span style="color:#c41a16">"ContactInfo"</span>,
</span></span><span style="display:flex;"><span>    <span style="color:#000">"details"</span>: [
</span></span><span style="display:flex;"><span>      {
</span></span><span style="display:flex;"><span>        <span style="color:#000">"code"</span>: <span style="color:#c41a16">"NullValue"</span>,
</span></span><span style="display:flex;"><span>        <span style="color:#000">"target"</span>: <span style="color:#c41a16">"PhoneNumber"</span>,
</span></span><span style="display:flex;"><span>        <span style="color:#000">"message"</span>: <span style="color:#c41a16">"Phone number must not be null"</span>
</span></span><span style="display:flex;"><span>      },
</span></span><span style="display:flex;"><span>      {
</span></span><span style="display:flex;"><span>        <span style="color:#000">"code"</span>: <span style="color:#c41a16">"NullValue"</span>,
</span></span><span style="display:flex;"><span>        <span style="color:#000">"target"</span>: <span style="color:#c41a16">"LastName"</span>,
</span></span><span style="display:flex;"><span>        <span style="color:#000">"message"</span>: <span style="color:#c41a16">"Last name must not be null"</span>
</span></span><span style="display:flex;"><span>      },
</span></span><span style="display:flex;"><span>      {
</span></span><span style="display:flex;"><span>        <span style="color:#000">"code"</span>: <span style="color:#c41a16">"MalformedValue"</span>,
</span></span><span style="display:flex;"><span>        <span style="color:#000">"target"</span>: <span style="color:#c41a16">"Address"</span>,
</span></span><span style="display:flex;"><span>        <span style="color:#000">"message"</span>: <span style="color:#c41a16">"Address is not valid"</span>
</span></span><span style="display:flex;"><span>      }
</span></span><span style="display:flex;"><span>    ]
</span></span><span style="display:flex;"><span>  }
</span></span><span style="display:flex;"><span>}
</span></span></code></pre></div><p>GITHUB 在其 REST API 平台上也有示例</p>
<blockquote>
<p><a href="https://docs.github.com/en/rest/overview/resources-in-the-rest-api?apiVersion=2022-11-28#client-errors">https://docs.github.com/en/rest/overview/resources-in-the-rest-api?apiVersion=2022-11-28#client-errors</a></p>
</blockquote>
<div class="highlight"><pre tabindex="0" style="background-color:#fff;-moz-tab-size:4;-o-tab-size:4;tab-size:4;"><code class="language-json" data-lang="json"><span style="display:flex;"><span>{
</span></span><span style="display:flex;"><span>   <span style="color:#000">"message"</span>: <span style="color:#c41a16">"Validation Failed"</span>,
</span></span><span style="display:flex;"><span>   <span style="color:#000">"errors"</span>: [
</span></span><span style="display:flex;"><span>     {
</span></span><span style="display:flex;"><span>       <span style="color:#000">"resource"</span>: <span style="color:#c41a16">"Issue"</span>,
</span></span><span style="display:flex;"><span>       <span style="color:#000">"field"</span>: <span style="color:#c41a16">"title"</span>,
</span></span><span style="display:flex;"><span>       <span style="color:#000">"code"</span>: <span style="color:#c41a16">"missing_field"</span>
</span></span><span style="display:flex;"><span>     }
</span></span><span style="display:flex;"><span>   ]
</span></span><span style="display:flex;"><span> }
</span></span></code></pre></div><p>这里的 code 可以分为以下几类</p>
<table>
<thead>
<tr>
<th>Error code name</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>missing</td>
<td>A resource does not exist.</td>
</tr>
<tr>
<td>missing_field</td>
<td>A required field on a resource has not been set.</td>
</tr>
<tr>
<td>invalid</td>
<td>The formatting of a field is invalid. Review the documentation for more specific information.</td>
</tr>
<tr>
<td>already_exists</td>
<td>Another resource has the same value as this field. This can happen in resources that must have some unique key (such as label names).</td>
</tr>
<tr>
<td>unprocessable</td>
<td>The inputs provided were invalid.</td>
</tr>
</tbody>
</table>
<p>从  GITHUB 和微软的设计上我们可以得出一些规律</p>
<ul>
<li>code 是可读的</li>
<li>通常也会包含一个详细描述的 message 字段</li>
<li>根据响应，调用方有能力定位到导致错误的资源（字段）</li>
</ul>


`
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false
      }),
      Slash,
      CustomCodeBlock,
      ExcalidrawNode.configure({
        HTMLAttributes: {
          style: 'height: 500px;display:block',
          class: 'not-prose'
        }
      }),
      TaskList.configure({
        itemTypeName: 'taskItem',
        HTMLAttributes: {
          class: 'not-prose'
        }
      }),
      TaskItem.configure({
        nested: true
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return `Heading ${node.attrs.level}`
          }
          if (node.type.name === 'codeBlock') {
            return `Writing code...`
          }
          return "Writing or Press '/' for commands"
        },
        includeChildren: true
      }),
      Underline,
      CustomLink,
      CustomImage,
      CustomTable.configure({
        resizable: false,
        HTMLAttributes: {
          class: 'table-auto border border-stone-300 hover:outline hover:outline-blue-300'
        }
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-slate-300 bg-gray-100 dark:bg-gray-800 p-2'
        }
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'dark:border-stone-800'
        }
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-slate-300 focus:bg-cyan-50 hover:z-20 p-2'
        }
      })
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert p-3 bg-white',
        style: 'margin: 20px auto;',
        spellcheck: 'false'
      }
    }
  })
  const [isEditable, setIsEditable] = React.useState(true)

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable)
    }
  }, [isEditable, editor])

  interface BubbleMenuItem {
    icon: ({ className, width, height }) => JSX.Element
    name: string
    symbol: string
    onclick: () => boolean | undefined
  }

  const menuItems: BubbleMenuItem[] = [
    {
      icon: BoldIcon,
      name: 'Bold',
      symbol: 'bold',
      onclick: (): boolean | undefined => editor?.chain().focus().toggleBold().run()
    },
    {
      icon: ItalicIcon,
      name: 'Italic',
      symbol: 'italic',
      onclick: (): boolean | undefined => editor?.chain().focus().toggleItalic().run()
    },
    {
      icon: LinkIcon,
      name: 'Link',
      symbol: 'link',
      onclick: (): boolean | undefined => editor?.chain().focus().toggleLink({ href: '' }).run()
    },
    {
      icon: StrikethroughIcon,
      name: 'Strikethrough',
      symbol: 'strike',
      onclick: (): boolean | undefined => editor?.chain().focus().toggleStrike().run()
    },
    {
      icon: UnderlineIcon,
      name: 'Underline',
      symbol: 'underline',
      onclick: (): boolean | undefined => editor?.chain().focus().toggleUnderline().run()
    },
    {
      icon: QuoteIcon,
      name: 'Blockquote',
      symbol: 'blockquote',
      onclick: (): boolean | undefined => editor?.chain().focus().toggleBlockquote().run()
    },
    {
      icon: CodeIcon,
      name: 'Code',
      symbol: 'code',
      onclick: (): boolean | undefined => editor?.chain().focus().toggleCode().run()
    }
  ]
  return (
    <>
      {editor && (
        <BubbleMenu editor={editor} onChange={() => setIsEditable(!isEditable)}>
          <div className="bubble-menu">
            {menuItems.map((item) => (
              <button key={item.name} onClick={item.onclick} className={'bubble-menu-item'}>
                {item.icon({
                  className: editor.isActive(item.symbol) ? 'icon active' : 'icon',
                  width: 14,
                  height: 14
                })}
              </button>
            ))}
          </div>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </>
  )
}
export default Tiptap
