export const defualtContent = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Markdown syntax' }] },
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'basic' }] },
    {
      type: 'bulletList',
      attrs: { tight: true },
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'bold' }]
            }
          ]
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', marks: [{ type: 'italic' }], text: 'italic' }]
            }
          ]
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  marks: [{ type: 'italic' }, { type: 'strike' }],
                  text: 'strithrough'
                }
              ]
            }
          ]
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', marks: [{ type: 'underline' }], text: 'underline' }]
            }
          ]
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', marks: [{ type: 'code' }], text: 'code' }]
            }
          ]
        }
      ]
    },
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Task' }] },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'use ' },
        { type: 'text', marks: [{ type: 'code' }], text: '[ ]' },
        { type: 'text', text: ' to create task' }
      ]
    },
    {
      type: 'taskList',
      content: [
        {
          type: 'taskItem',
          attrs: {
            checked: true,
            createTime: '2023-07-30 00:00:00',
            doneTime: '2023-07-31 00:00:00'
          },
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'task' }] },
            {
              type: 'taskList',
              content: [
                {
                  type: 'taskItem',
                  attrs: { checked: false },
                  content: [
                    { type: 'paragraph', content: [{ type: 'text', text: 'nested task' }] },
                    {
                      type: 'taskList',
                      content: [
                        {
                          type: 'taskItem',
                          attrs: { checked: false },
                          content: [
                            {
                              type: 'paragraph',
                              content: [{ type: 'text', text: 'nested nested task' }]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'taskItem',
          attrs: { checked: false },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'task' }] }]
        },
        {
          type: 'taskItem',
          attrs: { checked: false },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'task' }] }]
        }
      ]
    },
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'List' }] },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'use ' },
        { type: 'text', marks: [{ type: 'code' }], text: '-' },
        { type: 'text', text: ' or ' },
        { type: 'text', marks: [{ type: 'code' }], text: '*' },
        { type: 'text', text: ' to create bulleted list, use number + ' },
        { type: 'text', marks: [{ type: 'code' }], text: '.' },
        { type: 'text', text: ' to create sorted list' }
      ]
    },
    { type: 'heading', attrs: { level: 4 }, content: [{ type: 'text', text: 'bulleted list' }] },
    {
      type: 'bulletList',
      attrs: { tight: true },
      content: [
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'bulleted list' }] },
            {
              type: 'bulletList',
              attrs: { tight: true },
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'nested bulleted list' }]
                    },
                    {
                      type: 'bulletList',
                      attrs: { tight: true },
                      content: [
                        {
                          type: 'listItem',
                          content: [
                            { type: 'paragraph', content: [{ type: 'text', text: 'nested' }] }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'list' }] }]
        }
      ]
    },
    { type: 'heading', attrs: { level: 4 }, content: [{ type: 'text', text: 'sorted list' }] },
    {
      type: 'orderedList',
      attrs: { tight: true, start: 1 },
      content: [
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'sorted list' }] }]
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'sorted list2' }] }]
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'sorted list3' }] }]
        }
      ]
    },
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Link' }] },
    {
      type: 'bulletList',
      attrs: { tight: true },
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'use markdown to create link: ' },
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'link',
                      attrs: { href: 'https://google.com', target: '_blank', class: null }
                    }
                  ],
                  text: 'google'
                }
              ]
            }
          ]
        }
      ]
    },
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Image' }] },
    {
      type: 'bulletList',
      attrs: { tight: true },
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'use markdown syntax to create image' }]
            }
          ]
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'support zoomable' }] }]
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'support resizeable' }] }]
        }
      ]
    },
    {
      type: 'image',
      attrs: {
        id: 'eae02269-e9f9-47a2-b731-8cf45d6b3555',
        src: 'https://blog.cc1234.cc/posts/http-status-and-code/img/1.png',
        alt: 'hello world',
        title: null,
        width: '540px',
        height: '255.25597269624575px'
      }
    },
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Table' }] },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'use ' },
        { type: 'text', marks: [{ type: 'code' }], text: '| xxx | xxx |' },
        { type: 'text', text: ' to create table' }
      ]
    },
    {
      type: 'table',
      content: [
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableHeader',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: ' id ' }] }]
            },
            {
              type: 'tableHeader',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: ' name ' }] }]
            },
            {
              type: 'tableHeader',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: ' time ' }] }]
            }
          ]
        },
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '1' }] }]
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'tom' }] }]
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '12:00' }] }]
            }
          ]
        },
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '2' }] }]
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'jack' }] }]
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '13:00' }] }]
            }
          ]
        },
        {
          type: 'tableRow',
          content: [
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '3' }] }]
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'tony' }] }]
            },
            {
              type: 'tableCell',
              attrs: { colspan: 1, rowspan: 1, colwidth: null },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '14:00' }] }]
            }
          ]
        }
      ]
    },
    { type: 'paragraph' },
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Code block' }] },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'use ' },
        { type: 'text', marks: [{ type: 'bold' }], text: '``` ' },
        { type: 'text', text: 'to create code block' }
      ]
    },
    {
      type: 'codeBlock',
      attrs: { language: 'JavaScript' },
      content: [{ type: 'text', text: "console.log('hello world!')" }]
    },
    { type: 'paragraph', content: [{ type: 'text', text: 'support mermaidjs' }] },
    {
      type: 'bulletList',
      attrs: { tight: true },
      content: [
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'mermaid sequence diagram' }] }
          ]
        }
      ]
    },
    {
      type: 'codeBlock',
      attrs: { language: 'Mermaid' },
      content: [
        {
          type: 'text',
          text: 'sequenceDiagram\n    Alice->>Bob: Hello Bob, how are you?\n    alt is sick\n        Bob->>Alice: Not so good :(\n    else is well\n        Bob->>Alice: Feeling fresh like a daisy\n    end\n    opt Extra response\n        Bob->>Alice: Thanks for asking\n    end'
        }
      ]
    },
    {
      type: 'codeBlock',
      attrs: { language: 'Mermaid' },
      content: [
        {
          type: 'text',
          text: `flowchart LR
          A[Hard edge] -->|Link text| B(Round edge)
          B --> C{Decision}
          C -->|One| D[Result one]
          C -->|Two| E[Result two]`
        }
      ]
    },
    {
      type: 'codeBlock',
      attrs: { language: 'Mermaid' },
      content: [
        {
          type: 'text',
          text: `pie title Pets adopted by volunteers
          "Dogs" : 386
          "Cats" : 85
          "Rats" : 15`
        }
      ]
    },
    {
      type: 'bulletList',
      attrs: { tight: true },
      content: [
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'mermaid  user journey' }] }
          ]
        }
      ]
    },
    {
      type: 'codeBlock',
      attrs: { language: 'Mermaid' },
      content: [
        {
          type: 'text',
          text: 'journey\n    title My working day\n    section Go to work\n      Make tea: 5: Me\n      Go upstairs: 3: Me\n      Do work: 1: Me, Cat\n    section Go home\n      Go downstairs: 5: Me\n      Sit down: 5: Me'
        }
      ]
    },
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Excalidraw' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'use excalidraw to create whiteboard' }] },
    {
      type: 'blockquote',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'excalidraw!' }] }]
    },
    { type: 'paragraph' },
    {
      type: 'excalidraw',
      attrs: {
        id: null,
        data: '{"elements":[{"id":"PpAIbHzX9QGXPCT-GZhRi","type":"rectangle","x":82.5374755859375,"y":882.6124877929688,"width":212.800048828125,"height":57.60003662109375,"angle":0,"strokeColor":"#000000","backgroundColor":"transparent","fillStyle":"hachure","strokeWidth":1,"strokeStyle":"solid","roughness":1,"opacity":100,"groupIds":[],"roundness":{"type":3},"seed":1618610729,"version":71,"versionNonce":717278025,"isDeleted":true,"boundElements":null,"updated":1689606976744,"link":null,"locked":false},{"id":"Iv1rzsgAL_VW--6xhJFqz","type":"ellipse","x":149.737548828125,"y":869.0125122070312,"width":89.60003662109375,"height":76,"angle":0,"strokeColor":"#000000","backgroundColor":"transparent","fillStyle":"hachure","strokeWidth":1,"strokeStyle":"solid","roughness":1,"opacity":100,"groupIds":[],"roundness":{"type":2},"seed":1231522505,"version":78,"versionNonce":254605703,"isDeleted":false,"boundElements":null,"updated":1689606979042,"link":null,"locked":false},{"id":"7D8YACb3lEFIPVgL-nM11","type":"ellipse","x":315.3375244140625,"y":873.0125122070312,"width":80.800048828125,"height":94.4000244140625,"angle":0,"strokeColor":"#000000","backgroundColor":"transparent","fillStyle":"hachure","strokeWidth":1,"strokeStyle":"solid","roughness":1,"opacity":100,"groupIds":[],"roundness":{"type":2},"seed":1217475655,"version":87,"versionNonce":22972009,"isDeleted":false,"boundElements":null,"updated":1689606979042,"link":null,"locked":false},{"id":"ps_3bWaIyV4TCkcnlBkHT","type":"line","x":183.33758544921875,"y":1033.8125610351562,"width":191.20001220703125,"height":94.39996337890625,"angle":0,"strokeColor":"#000000","backgroundColor":"transparent","fillStyle":"hachure","strokeWidth":1,"strokeStyle":"solid","roughness":1,"opacity":100,"groupIds":[],"roundness":{"type":2},"seed":1837398503,"version":152,"versionNonce":780284071,"isDeleted":false,"boundElements":null,"updated":1689606979042,"link":null,"locked":false,"points":[[0,0],[40.79998779296875,91.199951171875],[118.39996337890625,94.39996337890625],[191.20001220703125,7.199951171875]],"lastCommittedPoint":[191.20001220703125,7.199951171875],"startBinding":null,"endBinding":null,"startArrowhead":null,"endArrowhead":null},{"id":"VslQqzmXWiGA_wEGeocCr","type":"text","x":435.33770751953125,"y":885.8125,"width":224.4326507667081,"height":51.39996337890628,"angle":0,"strokeColor":"#000000","backgroundColor":"transparent","fillStyle":"hachure","strokeWidth":1,"strokeStyle":"solid","roughness":1,"opacity":100,"groupIds":[],"roundness":null,"seed":409174983,"version":399,"versionNonce":1459786409,"isDeleted":false,"boundElements":null,"updated":1689607005493,"link":null,"locked":false,"text":"Excalidraw!","fontSize":41.11997070312502,"fontFamily":1,"textAlign":"left","verticalAlign":"top","baseline":36,"containerId":null,"originalText":"Excalidraw!","lineHeight":1.25}],"appState":{"showWelcomeScreen":true,"theme":"light","collaborators":[],"currentChartType":"bar","currentItemBackgroundColor":"transparent","currentItemEndArrowhead":"arrow","currentItemFillStyle":"hachure","currentItemFontFamily":1,"currentItemFontSize":20,"currentItemOpacity":100,"currentItemRoughness":1,"currentItemStartArrowhead":null,"currentItemStrokeColor":"#000000","currentItemRoundness":"round","currentItemStrokeStyle":"solid","currentItemStrokeWidth":1,"currentItemTextAlign":"left","cursorButton":"up","draggingElement":null,"editingElement":null,"editingGroupId":null,"editingLinearElement":null,"activeTool":{"type":"selection","customType":null,"locked":false,"lastActiveTool":null},"penMode":false,"penDetected":false,"errorMessage":null,"exportBackground":true,"exportScale":1,"exportEmbedScene":false,"exportWithDarkMode":false,"fileHandle":null,"gridSize":null,"isBindingEnabled":true,"isSidebarDocked":false,"isLoading":false,"isResizing":false,"isRotating":false,"lastPointerDownWith":"mouse","multiElement":null,"name":"Untitled-2023-07-17-2315","contextMenu":null,"openMenu":null,"openPopup":null,"openSidebar":null,"openDialog":null,"pasteDialog":{"shown":false,"data":null},"previousSelectedElementIds":{"fmXfwPwcUYmuTlvbh4EaK":true},"resizingElement":null,"scrolledOutside":false,"scrollX":0,"scrollY":-750,"selectedElementIds":{"_V65wTR1dEvZEqxQIOgz8":true},"selectedGroupIds":{},"selectionElement":null,"shouldCacheIgnoreZoom":false,"showStats":false,"startBoundElement":null,"suggestedBindings":[],"toast":null,"viewBackgroundColor":"#ffffff","zenModeEnabled":true,"zoom":{"value":1},"viewModeEnabled":false,"pendingImageElementId":null,"showHyperlinkPopup":false,"selectedLinearElement":null,"offsetLeft":538.2625122070312,"offsetTop":516.1875,"width":800,"height":600},"files":{}}'
      }
    },
    { type: 'paragraph' },
    { type: 'paragraph' }
  ]
}
