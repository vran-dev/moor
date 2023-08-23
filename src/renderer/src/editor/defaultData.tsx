export const defaultData = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: '线上订单延迟到账',
            type: 'text',
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'heading',
        version: 1,
        tag: 'h1'
      },
      {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'family-order documentation :  ',
                type: 'text',
                version: 1
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'https://confluence.build.ingka.ikea.com/pages/viewpage.action?pageId=605485520',
                    type: 'text',
                    version: 1
                  }
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'link',
                version: 1,
                rel: 'noreferrer',
                target: null,
                title: null,
                url: 'https://confluence.build.ingka.ikea.com/pages/viewpage.action?pageId=605485520'
              }
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'listitem',
            version: 1,
            value: 1
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'order-hub documentation : ',
                type: 'text',
                version: 1
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'https://confluence.build.ingka.ikea.com/display/CNODI/Order+Message',
                    type: 'text',
                    version: 1
                  }
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'link',
                version: 1,
                rel: 'noreferrer',
                target: null,
                title: null,
                url: 'https://confluence.build.ingka.ikea.com/display/CNODI/Order+Message'
              }
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'listitem',
            version: 1,
            value: 2
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'list',
        version: 1,
        listType: 'bullet',
        start: 1,
        tag: 'ul'
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: '发布依赖',
            type: 'text',
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'heading',
        version: 1,
        tag: 'h2'
      },
      {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: 'background-color: #FF5575;',
                text: 'family-order',
                type: 'text',
                version: 1
              }
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'listitem',
            version: 1,
            value: 1
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'orderhub',
                type: 'text',
                version: 1
              }
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'listitem',
            version: 1,
            value: 2
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'list',
        version: 1,
        listType: 'check',
        start: 1,
        tag: 'ul'
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: '配置',
            type: 'text',
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'heading',
        version: 1,
        tag: 'h2'
      },
      {
        format: '',
        type: 'iframe',
        version: 1,
        data: '',
        options: {
          width: 800,
          height: 600
        }
      },
      {
        format: 'start',
        type: 'image',
        version: 1
      },
      {
        format: 'start',
        type: 'columns',
        version: 1,
        count: 2,
        widthRatio: [0.5, 0.5],
        children: [
          {
            root: {
              children: [
                {
                  format: 'start',
                  type: 'callout',
                  version: 1,
                  bgColor: '#22D9AE',
                  children: {
                    root: {
                      children: [
                        {
                          children: [
                            {
                              detail: 0,
                              format: 0,
                              mode: 'normal',
                              style: '',
                              text: '😄 QA',
                              type: 'text',
                              version: 1
                            }
                          ],
                          direction: 'ltr',
                          format: '',
                          indent: 0,
                          type: 'paragraph',
                          version: 1
                        }
                      ],
                      direction: 'ltr',
                      format: '',
                      indent: 0,
                      type: 'root',
                      version: 1
                    }
                  }
                },
                {
                  format: '',
                  type: 'codemirror',
                  version: 1,
                  data: "aliCloud:\n  ons:\n    orderhub:\n      groupId: 'GID_family_member_task_orderhub_order'\n      topic: 'dtc-online-order-qa-topic'\n      tag: 'dtc-online-tag'",
                  language: 'YAML',
                  layout: 'SplitVertical'
                }
              ],
              direction: null,
              format: '',
              indent: 0,
              type: 'root',
              version: 1
            }
          },
          {
            root: {
              children: [
                {
                  format: 'start',
                  type: 'callout',
                  version: 1,
                  bgColor: '#22D9AE',
                  children: {
                    root: {
                      children: [
                        {
                          children: [
                            {
                              detail: 0,
                              format: 0,
                              mode: 'normal',
                              style: '',
                              text: '😄 PROD',
                              type: 'text',
                              version: 1
                            }
                          ],
                          direction: 'ltr',
                          format: '',
                          indent: 0,
                          type: 'paragraph',
                          version: 1
                        }
                      ],
                      direction: 'ltr',
                      format: '',
                      indent: 0,
                      type: 'root',
                      version: 1
                    }
                  }
                },
                {
                  format: '',
                  type: 'codemirror',
                  version: 1,
                  data: "aliCloud:\n  ons:\n    orderhub:\n      groupId: 'GID_family_member_task_orderhub_order'\n      topic: 'dtc-online-order-qa-topic'\n      tag: 'dtc-online-tag'",
                  language: 'YAML',
                  layout: 'SplitVertical'
                }
              ],
              direction: null,
              format: '',
              indent: 0,
              type: 'root',
              version: 1
            }
          }
        ]
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: '订单报文',
            type: 'text',
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'heading',
        version: 1,
        tag: 'h2'
      },
      {
        format: 'start',
        type: 'columns',
        version: 1,
        count: 2,
        widthRatio: [0.5, 0.5],
        children: [
          {
            root: {
              children: [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: 'normal',
                      style: '',
                      text: 'Order Processed',
                      type: 'text',
                      version: 1
                    }
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  type: 'heading',
                  version: 1,
                  tag: 'h2'
                },
                {
                  format: '',
                  type: 'codemirror',
                  version: 1,
                  data: '{\n    "extend":{\n        "customer":{\n            "level":3,\n            "birthday":"1988-08-18",\n            "customer_id":367123759920,\n            "card_number":"6275980339105557191",\n            "party_uid":"CIAM6bae-6a59-4d7d-aa92-ef9f98e1e864",\n            "prefer_store":"856"\n        },\n        "order_type":"REFUND",\n        "point_able_amount":29.99\n    },\n    "eventType":"COMPLETED",\n    "sendTime":1645524467609,\n    "order":{\n        "orderNo":"order-hub-test-created2-02",\n        "clientSystem":"MINI_PROGRAM",\n        "clientVersion":"v1",\n        "subClientSystem":"LIVE_STREAM",\n        "storeCode":"856",\n        "storeType":"STO",\n        "currencyCode":"CNY",\n        "creationMethod":"INTERNET",\n        "customerId":"CIAM6bae-6a59-4d7d-aa92-ef9f98e1e864",\n        "familyNo":"6275980339105557191",\n        "employeeOrderFlag":false,\n        "employeeEmail":null,\n        "hasVTP":false,\n        "applyTime":1645524467609,\n        "locationStore":"549",\n        "payDueTime":1645524467609,\n        "isellId":150403534,\n        "isellIdSource":"A04",\n        "items":[\n            {\n                "itemNo":"70163692",\n                "itemType":"ART",\n                "quantity":1,\n                "netAmount":1182,\n                "salesPrice":1182\n            },\n            {\n                "itemNo":"60459892",\n                "itemType":"ART",\n                "quantity":1,\n                "netAmount":1182,\n                "salesPrice":1182\n            }\n        ],\n        "deliveryInfos":[\n            {\n                "deliveryType":"HOME_DELIVERY",\n                "transportMethod":"PARCEL",\n                "deliveryOption":"HOME_DELIVERY",\n                "subType":"STANDARD"\n            }\n        ],\n        "serviceInfos":[\n            {\n                "netAmount":20,\n                "serviceItemNo":"60000525",\n                "serviceName":"Planning Business",\n                "serviceItemType":"SGR",\n                "serviceProductId":"FURNITURE_ASSEMBLY",\n                "serviceProviderId":"1b5dc3c6-402c-4535-98e5-08e9007472d2"\n            }\n        ],\n        "priceInfo":{\n            "deliveryAmount":169,\n            "deliveryNetAmount":169,\n            "goodsAmount":1454.85,\n            "goodsNetAmount":1454.85,\n            "serviceAmount":10,\n            "serviceNetAmount":10,\n            "familyDiscounts":1,\n            "couponDiscounts":1,\n            "employeeDiscounts":1,\n            "totalAmount":1622.85,\n            "totalDiscounts":3,\n            "discounts":1\n        },\n        "couponInfos":[\n            {\n                "id":"220567495700090880",\n                "code":"NEWUSERSMP"\n            }\n        ],\n        "paymentInfos":[\n            {\n                "currencyCode":"CNY",\n                "amount":92,\n                "paymentGatewayReferenceId":"2556912521567221761",\n                "paymentGateway":"IOPG",\n                "status":"CAPTURED",\n                "tenderType":"EWALLET",\n                "paymentBrand":"upacp_wap",\n                "transactionTime":1629453934000,\n                "paymentSystem":"UNKNOWN"\n            }\n        ],\n        "orderChannel":"ONLINE",\n        "offlineRelatedIkeaOrderNos":[\n            "150403534"\n        ],\n        "errorInfo":{\n            "code":"undefined",\n            "message":"undefined"\n        }\n    }\n}',
                  language: 'JSON',
                  layout: 'SplitVertical'
                },
                {
                  children: [],
                  direction: null,
                  format: '',
                  indent: 0,
                  type: 'paragraph',
                  version: 1
                }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'root',
              version: 1
            }
          },
          {
            root: {
              children: [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: 'normal',
                      style: '',
                      text: 'Order Completed',
                      type: 'text',
                      version: 1
                    }
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  type: 'heading',
                  version: 1,
                  tag: 'h2'
                },
                {
                  format: '',
                  type: 'codemirror',
                  version: 1,
                  data: '{\n    "extend":{\n        "customer":{\n            "level":3,\n            "birthday":"1988-08-18",\n            "customer_id":367123759920,\n            "card_number":"6275980339105557191",\n            "party_uid":"CIAM6bae-6a59-4d7d-aa92-ef9f98e1e864",\n            "prefer_store":"856"\n        },\n        "order_type":"REFUND",\n        "point_able_amount":59.99\n    },\n    "eventType":"PROCESSED",\n    "sendTime":1645524467609,\n    "order":{\n        "orderNo":"order-hub-test-created2-02",\n        "clientSystem":"MINI_PROGRAM",\n        "clientVersion":"v1",\n        "subClientSystem":"LIVE_STREAM",\n        "storeCode":"856",\n        "storeType":"STO",\n        "currencyCode":"CNY",\n        "creationMethod":"INTERNET",\n        "customerId":"CIAM6bae-6a59-4d7d-aa92-ef9f98e1e864",\n        "familyNo":"6275980339105557191",\n        "employeeOrderFlag":false,\n        "employeeEmail":null,\n        "hasVTP":false,\n        "applyTime":1645524467609,\n        "locationStore":"549",\n        "payDueTime":1645524467609,\n        "isellId":150403534,\n        "isellIdSource":"A04",\n        "items":[\n            {\n                "itemNo":"70163692",\n                "itemType":"ART",\n                "quantity":1,\n                "netAmount":1182,\n                "salesPrice":1182\n            },\n            {\n                "itemNo":"60459892",\n                "itemType":"ART",\n                "quantity":1,\n                "netAmount":1182,\n                "salesPrice":1182\n            }\n        ],\n        "deliveryInfos":[\n            {\n                "deliveryType":"HOME_DELIVERY",\n                "transportMethod":"PARCEL",\n                "deliveryOption":"HOME_DELIVERY",\n                "subType":"STANDARD"\n            }\n        ],\n        "serviceInfos":[\n            {\n                "netAmount":20,\n                "serviceItemNo":"60000525",\n                "serviceName":"Planning Business",\n                "serviceItemType":"SGR",\n                "serviceProductId":"FURNITURE_ASSEMBLY",\n                "serviceProviderId":"1b5dc3c6-402c-4535-98e5-08e9007472d2"\n            }\n        ],\n        "priceInfo":{\n            "deliveryAmount":169,\n            "deliveryNetAmount":169,\n            "goodsAmount":1454.85,\n            "goodsNetAmount":1454.85,\n            "serviceAmount":10,\n            "serviceNetAmount":10,\n            "familyDiscounts":1,\n            "couponDiscounts":1,\n            "employeeDiscounts":1,\n            "totalAmount":1622.85,\n            "totalDiscounts":3,\n            "discounts":1\n        },\n        "couponInfos":[\n            {\n                "id":"220567495700090880",\n                "code":"NEWUSERSMP"\n            }\n        ],\n        "paymentInfos":[\n            {\n                "currencyCode":"CNY",\n                "amount":92,\n                "paymentGatewayReferenceId":"2556912521567221761",\n                "paymentGateway":"IOPG",\n                "status":"CAPTURED",\n                "tenderType":"EWALLET",\n                "paymentBrand":"upacp_wap",\n                "transactionTime":1629453934000,\n                "paymentSystem":"UNKNOWN"\n            }\n        ],\n        "orderChannel":"ONLINE",\n        "offlineRelatedIkeaOrderNos":[\n            "150403534"\n        ],\n        "errorInfo":{\n            "code":"undefined",\n            "message":"undefined"\n        }\n    }\n}',
                  language: 'JSON',
                  layout: 'SplitVertical'
                },
                {
                  children: [],
                  direction: null,
                  format: '',
                  indent: 0,
                  type: 'paragraph',
                  version: 1
                }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'root',
              version: 1
            }
          }
        ]
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: '订单处理流程',
            type: 'text',
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'heading',
        version: 1,
        tag: 'h2'
      },
      {
        format: 'start',
        type: 'columns',
        version: 1,
        count: 3,
        widthRatio: [0.3333333333333333, 0.3333333333333333, 0.3333333333333333],
        children: [
          {
            root: {
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: '下单',
                          type: 'text',
                          version: 1
                        }
                      ],
                      direction: 'ltr',
                      format: '',
                      indent: 0,
                      type: 'listitem',
                      version: 1,
                      value: 1
                    }
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  type: 'list',
                  version: 1,
                  listType: 'bullet',
                  start: 1,
                  tag: 'ul'
                },
                {
                  format: '',
                  type: 'codemirror',
                  version: 1,
                  data: 'sequenceDiagram\n\tfamily-order -->> member-task: [event]order created\n\tmember-task -> member-task: reward calculate\n\tmember-task ->> member-task: save reward as status = WAITING\n\tmember-task ->> family-order: ok',
                  language: 'Mermaid',
                  layout: 'Preview'
                }
              ],
              direction: null,
              format: '',
              indent: 0,
              type: 'root',
              version: 1
            }
          },
          {
            root: {
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: '确认收货前退货退款',
                          type: 'text',
                          version: 1
                        }
                      ],
                      direction: 'ltr',
                      format: '',
                      indent: 0,
                      type: 'listitem',
                      version: 1,
                      value: 1
                    }
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  type: 'list',
                  version: 1,
                  listType: 'bullet',
                  start: 1,
                  tag: 'ul'
                },
                {
                  format: '',
                  type: 'codemirror',
                  version: 1,
                  data: 'sequenceDiagram\n\tfamily-order -->> member-task: [event] order Refund\n\tmember-task ->> member-task: find rewards by [orderNo]\n\tmember-task ->> member-task: status == [WAITING] ? recalculate reward amount\n\tmember-task ->> member-task: update reward record\n\tmember-task ->> family-order: ok',
                  language: 'Mermaid',
                  layout: 'Preview'
                }
              ],
              direction: null,
              format: '',
              indent: 0,
              type: 'root',
              version: 1
            }
          },
          {
            root: {
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: '确认收货',
                          type: 'text',
                          version: 1
                        }
                      ],
                      direction: 'ltr',
                      format: '',
                      indent: 0,
                      type: 'listitem',
                      version: 1,
                      value: 1
                    }
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  type: 'list',
                  version: 1,
                  listType: 'bullet',
                  start: 1,
                  tag: 'ul'
                },
                {
                  format: '',
                  type: 'codemirror',
                  version: 1,
                  data: 'sequenceDiagram\n\tfamily-order -->> member-task: [event]order completed\n\tmember-task ->> member-task: find [WAITING] rewards\n    member-task ->> point: grant points\n    point ->> member-task: grant ok\t\n    member-task ->> member-task: update status to [SUCCESS]\n\tmember-task ->> family-order: ok',
                  language: 'Mermaid',
                  layout: 'Preview'
                }
              ],
              direction: null,
              format: '',
              indent: 0,
              type: 'root',
              version: 1
            }
          }
        ]
      },
      {
        children: [],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1
      },
      {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: '确认收货后退款',
                type: 'text',
                version: 1
              }
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'listitem',
            version: 1,
            value: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'list',
        version: 1,
        listType: 'bullet',
        start: 1,
        tag: 'ul'
      },
      {
        format: '',
        type: 'codemirror',
        version: 1,
        data: 'sequenceDiagram\n\tfamily-order -->> member-task: [event]order completed\n\tmember-task ->> member-task: find [WAITING] rewards\n    member-task ->> point: grant points\n    point ->> member-task: grant ok\t\n    member-task ->> member-task: update status to [SUCCESS]\n\tmember-task ->> family-order: ok',
        language: 'Mermaid',
        layout: 'Preview'
      },
      {
        children: [],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'Typeahead Menu',
            type: 'text',
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'heading',
        version: 1,
        tag: 'h2'
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: '你可以输入以下字符获取提示菜单',
            type: 'text',
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1
      },
      {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: '/ 可以快速的触发功能 🆗',
                type: 'text',
                version: 1
              }
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'listitem',
            version: 1,
            value: 1
          },
          {
            children: [
              {
                detail: 0,
                format: 1,
                mode: 'normal',
                style: '',
                text: ':',
                type: 'text',
                version: 1
              },
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: ' 可以获取 emoji 的选择菜单 😄',
                type: 'text',
                version: 1
              }
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'listitem',
            version: 1,
            value: 2
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: '``` 可以获取 code language 的选择菜单 👨‍💻',
                type: 'text',
                version: 1
              }
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'listitem',
            version: 1,
            value: 3
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'list',
        version: 1,
        listType: 'bullet',
        start: 1,
        tag: 'ul'
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'Image',
            type: 'text',
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'heading',
        version: 1,
        tag: 'h2'
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: '图片嵌入',
            type: 'text',
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1
      },
      {
        children: [],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1
      },
      {
        format: 'start',
        type: 'image',
        version: 1,
        height: 309,
        src: 'https://prod-mpp-loyalty-booster-point-mall-image.oss-cn-shanghai.aliyuncs.com/d26bafd9dba34104b7f08261aea5c4b9.jpg',
        width: 309
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'excalidraw',
            type: 'text',
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'heading',
        version: 1,
        tag: 'h2'
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: '你可以通过创建 excalidraw 来进行白板创作',
            type: 'text',
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1
      },
      {
        format: 'start',
        type: 'excalidraw',
        version: 1,
        data: '{"elements":[{"type":"ellipse","version":52,"versionNonce":1096932993,"isDeleted":false,"id":"UjBb7c8r9rkEWcA5IcQrl","fillStyle":"hachure","strokeWidth":1,"strokeStyle":"solid","roughness":1,"opacity":100,"angle":0,"x":83.84375,"y":140.43359375,"strokeColor":"#000000","backgroundColor":"transparent","width":116.74609375,"height":98.9609375,"seed":599911119,"groupIds":[],"roundness":{"type":2},"boundElements":[],"updated":1692076936364,"link":null,"locked":false},{"type":"ellipse","version":98,"versionNonce":1243086575,"isDeleted":false,"id":"mwyy4ZsF6j_zMZ9CYDXXE","fillStyle":"hachure","strokeWidth":1,"strokeStyle":"solid","roughness":1,"opacity":100,"angle":0,"x":256.177734375,"y":136.5703125,"strokeColor":"#000000","backgroundColor":"transparent","width":116.74609375,"height":98.9609375,"seed":599911119,"groupIds":[],"roundness":{"type":2},"boundElements":[],"updated":1692076940029,"link":null,"locked":false},{"type":"line","version":283,"versionNonce":1898573999,"isDeleted":false,"id":"Hj0NjKyc_WqMh3AGaRC-d","fillStyle":"hachure","strokeWidth":1,"strokeStyle":"solid","roughness":1,"opacity":100,"angle":0,"x":147.55078125,"y":293.83984375,"strokeColor":"#000000","backgroundColor":"transparent","width":160.5390625,"height":94.71484375,"seed":43969409,"groupIds":[],"roundness":{"type":2},"boundElements":[],"updated":1692076947694,"link":null,"locked":false,"startBinding":null,"endBinding":null,"lastCommittedPoint":null,"startArrowhead":null,"endArrowhead":null,"points":[[0,0],[53.4609375,81.07421875],[160.5390625,-13.640625]]},{"type":"line","version":24,"versionNonce":1951824961,"isDeleted":false,"id":"BN_JqUHIf5YkdODfbOZ1a","fillStyle":"hachure","strokeWidth":1,"strokeStyle":"solid","roughness":1,"opacity":100,"angle":0,"x":120.41015625,"y":192.546875,"strokeColor":"#000000","backgroundColor":"transparent","width":43.02734375,"height":0.7109375,"seed":119931599,"groupIds":[],"roundness":{"type":2},"boundElements":[],"updated":1692076951296,"link":null,"locked":false,"startBinding":null,"endBinding":null,"lastCommittedPoint":null,"startArrowhead":null,"endArrowhead":null,"points":[[0,0],[43.02734375,-0.7109375]]},{"type":"line","version":53,"versionNonce":2038112449,"isDeleted":false,"id":"69KmzIYDgs_2yGaVlCwf9","fillStyle":"hachure","strokeWidth":1,"strokeStyle":"solid","roughness":1,"opacity":100,"angle":0,"x":280.91796875,"y":189.02734375,"strokeColor":"#000000","backgroundColor":"transparent","width":66.4375,"height":3.51953125,"seed":1604275233,"groupIds":[],"roundness":{"type":2},"boundElements":[],"updated":1692076958662,"link":null,"locked":false,"startBinding":null,"endBinding":null,"lastCommittedPoint":null,"startArrowhead":null,"endArrowhead":null,"points":[[0,0],[66.4375,-3.51953125]]},{"type":"rectangle","version":141,"versionNonce":277395311,"isDeleted":false,"id":"Ps-CE-RjsOcMrnoxi_5vo","fillStyle":"hachure","strokeWidth":1,"strokeStyle":"solid","roughness":1,"opacity":100,"angle":0,"x":440.0625,"y":217.484375,"strokeColor":"#000000","backgroundColor":"transparent","width":269.921875,"height":80.6953125,"seed":297492641,"groupIds":[],"roundness":{"type":3},"boundElements":[{"type":"text","id":"kl0p4XJZsxClrahdoSaZ7"}],"updated":1692076981413,"link":null,"locked":false},{"type":"text","version":81,"versionNonce":583603322,"isDeleted":false,"id":"kl0p4XJZsxClrahdoSaZ7","fillStyle":"hachure","strokeWidth":1,"strokeStyle":"solid","roughness":1,"opacity":100,"angle":0,"x":493.6634979248047,"y":245.33203125,"strokeColor":"#000000","backgroundColor":"transparent","width":162.71987915039062,"height":25,"seed":397807055,"groupIds":[],"roundness":null,"boundElements":[],"updated":1692780434903,"link":null,"locked":false,"fontSize":20,"fontFamily":1,"text":"Hello Excalidraw!","textAlign":"center","verticalAlign":"middle","containerId":"Ps-CE-RjsOcMrnoxi_5vo","originalText":"Hello Excalidraw!","lineHeight":1.25,"baseline":18},{"type":"text","version":2,"versionNonce":1033853871,"isDeleted":true,"id":"Mpxs7lXF6BNaEpjRYojGF","fillStyle":"hachure","strokeWidth":1,"strokeStyle":"solid","roughness":1,"opacity":100,"angle":0,"x":536.578125,"y":180.78125,"strokeColor":"#000000","backgroundColor":"transparent","width":10,"height":25,"seed":857007503,"groupIds":[],"roundness":null,"boundElements":[],"updated":1692076966620,"link":null,"locked":false,"fontSize":20,"fontFamily":1,"text":"","textAlign":"left","verticalAlign":"top","containerId":null,"originalText":"","lineHeight":1.25,"baseline":19},{"type":"rectangle","version":60,"versionNonce":897377729,"isDeleted":false,"id":"VFihc10Hq955WZGlc1jTb","fillStyle":"hachure","strokeWidth":1,"strokeStyle":"solid","roughness":1,"opacity":100,"angle":0,"x":37.1171875,"y":90.86328125,"strokeColor":"#000000","backgroundColor":"transparent","width":714.9921875,"height":349.54296875,"seed":1960306447,"groupIds":[],"roundness":{"type":3},"boundElements":[],"updated":1692076975177,"link":null,"locked":false}],"files":{}}',
        options: {
          zenEnabled: true,
          gridEnabled: false,
          readOnlyEnabled: false,
          width: 900,
          height: 600
        }
      },
      {
        children: [],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1
      },
      {
        format: 'start',
        type: 'excalidraw',
        version: 1,
        data: '{"elements":[{"type":"rectangle","version":129,"versionNonce":1229503681,"isDeleted":false,"id":"xMh7Teht4MBuXBoj5BsOg","fillStyle":"hachure","strokeWidth":1,"strokeStyle":"solid","roughness":1,"opacity":100,"angle":0,"x":346.76171875,"y":153.78125,"strokeColor":"#000000","backgroundColor":"transparent","width":200.3203125,"height":73.86328125,"seed":1069478625,"groupIds":[],"roundness":{"type":3},"boundElements":[{"type":"text","id":"c-IAGJPd_dCphQsiLHH-l"}],"updated":1692077022693,"link":null,"locked":false},{"type":"text","version":16,"versionNonce":425461798,"isDeleted":false,"id":"c-IAGJPd_dCphQsiLHH-l","fillStyle":"hachure","strokeWidth":1,"strokeStyle":"solid","roughness":1,"opacity":100,"angle":0,"x":425.1418991088867,"y":178.212890625,"strokeColor":"#000000","backgroundColor":"transparent","width":43.55995178222656,"height":25,"seed":1920219567,"groupIds":[],"roundness":null,"boundElements":[],"updated":1692780434913,"link":null,"locked":false,"fontSize":20,"fontFamily":1,"text":"Hello","textAlign":"center","verticalAlign":"middle","containerId":"xMh7Teht4MBuXBoj5BsOg","originalText":"Hello","lineHeight":1.25,"baseline":18},{"type":"rectangle","version":121,"versionNonce":106089807,"isDeleted":false,"id":"ypTt7DKn3eJTuy6j0MlqF","fillStyle":"hachure","strokeWidth":1,"strokeStyle":"solid","roughness":1,"opacity":100,"angle":0,"x":226.04296875,"y":279.576171875,"strokeColor":"#000000","backgroundColor":"transparent","width":200.3203125,"height":73.86328125,"seed":1069478625,"groupIds":[],"roundness":{"type":3},"boundElements":[{"type":"text","id":"W9dq7dWngM4S_bujC8DWC"}],"updated":1692077030896,"link":null,"locked":false},{"type":"text","version":16,"versionNonce":1080325434,"isDeleted":false,"id":"W9dq7dWngM4S_bujC8DWC","fillStyle":"hachure","strokeWidth":1,"strokeStyle":"solid","roughness":1,"opacity":100,"angle":0,"x":304.4231491088867,"y":304.0078125,"strokeColor":"#000000","backgroundColor":"transparent","width":43.55995178222656,"height":25,"seed":643744577,"groupIds":[],"roundness":null,"boundElements":[],"updated":1692780434913,"link":null,"locked":false,"fontSize":20,"fontFamily":1,"text":"Hello","textAlign":"center","verticalAlign":"middle","containerId":"ypTt7DKn3eJTuy6j0MlqF","originalText":"Hello","lineHeight":1.25,"baseline":18},{"type":"rectangle","version":180,"versionNonce":1399610031,"isDeleted":false,"id":"fxy55geLyIhoAzbNYtHvt","fillStyle":"hachure","strokeWidth":1,"strokeStyle":"solid","roughness":1,"opacity":100,"angle":0,"x":469.203125,"y":281.380859375,"strokeColor":"#000000","backgroundColor":"transparent","width":200.3203125,"height":73.86328125,"seed":1069478625,"groupIds":[],"roundness":{"type":3},"boundElements":[{"type":"text","id":"2DrJMXiBq1yMJ7EV_yOJt"}],"updated":1692077026544,"link":null,"locked":false},{"type":"text","version":16,"versionNonce":1043600230,"isDeleted":false,"id":"2DrJMXiBq1yMJ7EV_yOJt","fillStyle":"hachure","strokeWidth":1,"strokeStyle":"solid","roughness":1,"opacity":100,"angle":0,"x":543.7433013916016,"y":305.8125,"strokeColor":"#000000","backgroundColor":"transparent","width":51.239959716796875,"height":25,"seed":104976353,"groupIds":[],"roundness":null,"boundElements":[],"updated":1692780434913,"link":null,"locked":false,"fontSize":20,"fontFamily":1,"text":"World","textAlign":"center","verticalAlign":"middle","containerId":"fxy55geLyIhoAzbNYtHvt","originalText":"World","lineHeight":1.25,"baseline":18},{"type":"text","version":2,"versionNonce":267286529,"isDeleted":true,"id":"PoKZWQHP5wUn9TCUGnL-D","fillStyle":"hachure","strokeWidth":1,"strokeStyle":"solid","roughness":1,"opacity":100,"angle":0,"x":564.36328125,"y":305.8125,"strokeColor":"#000000","backgroundColor":"transparent","width":10,"height":25,"seed":1840763969,"groupIds":[],"roundness":null,"boundElements":[],"updated":1692077026211,"link":null,"locked":false,"fontSize":20,"fontFamily":1,"text":"","textAlign":"center","verticalAlign":"middle","containerId":"fxy55geLyIhoAzbNYtHvt","originalText":"","lineHeight":1.25,"baseline":19},{"type":"rectangle","version":240,"versionNonce":823630497,"isDeleted":false,"id":"EJ7iD6ZFWwDTFi8Ixgnc6","fillStyle":"hachure","strokeWidth":1,"strokeStyle":"solid","roughness":1,"opacity":100,"angle":0,"x":328.08203125,"y":397.810546875,"strokeColor":"#000000","backgroundColor":"transparent","width":200.3203125,"height":73.86328125,"seed":1069478625,"groupIds":[],"roundness":{"type":3},"boundElements":[{"type":"text","id":"RRIEQSYdWBcH7A87tZqXB"}],"updated":1692077033688,"link":null,"locked":false},{"type":"text","version":16,"versionNonce":2102771194,"isDeleted":false,"id":"RRIEQSYdWBcH7A87tZqXB","fillStyle":"hachure","strokeWidth":1,"strokeStyle":"solid","roughness":1,"opacity":100,"angle":0,"x":402.62220764160156,"y":422.2421875,"strokeColor":"#000000","backgroundColor":"transparent","width":51.239959716796875,"height":25,"seed":470166991,"groupIds":[],"roundness":null,"boundElements":[],"updated":1692780434913,"link":null,"locked":false,"fontSize":20,"fontFamily":1,"text":"World","textAlign":"center","verticalAlign":"middle","containerId":"EJ7iD6ZFWwDTFi8Ixgnc6","originalText":"World","lineHeight":1.25,"baseline":18}],"files":{}}',
        options: {
          zenEnabled: true,
          gridEnabled: false,
          readOnlyEnabled: true,
          width: 800,
          height: 600
        }
      },
      {
        children: [],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'Embed',
            type: 'text',
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'heading',
        version: 1,
        tag: 'h2'
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: ' ',
            type: 'text',
            version: 1
          }
        ],
        direction: null,
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1
      },
      {
        format: '',
        type: 'iframe',
        version: 1,
        data: '<iframe style="border: 1px solid rgba(0, 0, 0, 0.1);" width="800" height="450" src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FBj3xnMTY6Wqd2bV0stUj27%2FMoor%3Ftype%3Ddesign%26node-id%3D0%253A1%26mode%3Ddesign%26t%3Dk9Qh6ul421M2OZcH-1" allowfullscreen></iframe>',
        options: {
          width: 800,
          height: 600
        }
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'Others',
            type: 'text',
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'heading',
        version: 1,
        tag: 'h2'
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'Welcome to the playground',
            type: 'text',
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'heading',
        version: 1,
        tag: 'h1'
      },
      {
        children: [],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1
      },
      {
        format: 'start',
        type: 'image',
        version: 1,
        src: 'https://picsum.photos/200/300'
      },
      {
        format: '',
        type: 'codemirror',
        version: 1,
        data: '{\n  "id":1,\n  "name": "moor",\n  "version": "1.0.0-release"\n}\n',
        language: 'JSON',
        layout: 'SplitVertical'
      },
      {
        format: '',
        type: 'codemirror',
        version: 1,
        data: "Date date = new Date()\nconsole.log('hello world! '+ date);\n",
        language: 'JavaScript',
        layout: 'SplitVertical'
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: "In case you were wondering what the black box at the bottom is – it's the debug view, showing the current state of the editor. You can disable it by pressing on the settings control in the bottom-left of your screen and toggling the debug view setting.",
            type: 'text',
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'quote',
        version: 1
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'The playground is a demo environment built with ',
            type: 'text',
            version: 1
          },
          {
            detail: 0,
            format: 16,
            mode: 'normal',
            style: '',
            text: '@lexical/react',
            type: 'text',
            version: 1
          },
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: '. Try typing in ',
            type: 'text',
            version: 1
          },
          {
            detail: 0,
            format: 1,
            mode: 'normal',
            style: '',
            text: 'some text',
            type: 'text',
            version: 1
          },
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: ' with ',
            type: 'text',
            version: 1
          },
          {
            detail: 0,
            format: 2,
            mode: 'normal',
            style: '',
            text: 'different',
            type: 'text',
            version: 1
          },
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: ' formats.',
            type: 'text',
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'Make sure to check out the various plugins in the toolbar. You can also use ',
            type: 'text',
            version: 1
          },
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: '#hashtags',
            type: 'hashtag',
            version: 1
          },
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: ' or @-mentions too!',
            type: 'text',
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: "If you'd like to find out more about Lexical, you can:",
            type: 'text',
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1
      },
      {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Visit the ',
                type: 'text',
                version: 1
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Lexical website',
                    type: 'text',
                    version: 1
                  }
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'link',
                version: 1,
                rel: null,
                target: null,
                title: null,
                url: 'https://lexical.dev/'
              },
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: ' for documentation and more information.',
                type: 'text',
                version: 1
              }
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'listitem',
            version: 1,
            value: 1
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Check out the code on our ',
                type: 'text',
                version: 1
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'GitHub repository',
                    type: 'text',
                    version: 1
                  }
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'link',
                version: 1,
                rel: null,
                target: null,
                title: null,
                url: 'https://github.com/facebook/lexical'
              },
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: '.',
                type: 'text',
                version: 1
              }
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'listitem',
            version: 1,
            value: 2
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Playground code can be found ',
                type: 'text',
                version: 1
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'here',
                    type: 'text',
                    version: 1
                  }
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'link',
                version: 1,
                rel: null,
                target: null,
                title: null,
                url: 'https://github.com/facebook/lexical/tree/main/packages/lexical-playground'
              },
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: '.',
                type: 'text',
                version: 1
              }
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'listitem',
            version: 1,
            value: 3
          },
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Join our ',
                type: 'text',
                version: 1
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Discord Server',
                    type: 'text',
                    version: 1
                  }
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                type: 'link',
                version: 1,
                rel: null,
                target: null,
                title: null,
                url: 'https://discord.com/invite/KmG4wQnnD9'
              },
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: ' and chat with the team.',
                type: 'text',
                version: 1
              }
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'listitem',
            version: 1,
            value: 4
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'list',
        version: 1,
        listType: 'bullet',
        start: 1,
        tag: 'ul'
      },
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: "Lastly, we're constantly adding cool new features to this playground. So make sure you check back here when you next get a chance 🙂.",
            type: 'text',
            version: 1
          }
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1
      }
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1
  }
}
