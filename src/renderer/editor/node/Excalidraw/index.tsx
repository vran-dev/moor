import { NodeSpec } from 'prosemirror-model'

export const DEFAULT_EXCALIDRAW_DATA = ''

export const ExcalidrawNode = {
    name: 'excalidraw',
    group: 'block',
    atom: true,
    inline: false,
    isolating: true,
    selectable: true,
    attrs: {
        width: { default: 800 },
        height: { default: 500 },
        data: { default: DEFAULT_EXCALIDRAW_DATA },
        zenEnabled: { default: false },
        gridEnabled: { default: false },
        readOnlyEnabled: { default: false }
    },
    parseDOM: [
        {
            tag: 'div[data-type="excalidraw"]',
            getAttrs: (dom: HTMLElement) => {
                const width = dom.getAttribute('data-width')
                const height = dom.getAttribute('data-height')
                const data = dom.getAttribute('data-content')
                const zenEnabled = dom.getAttribute('data-zenEnabled')
                const gridEnabled = dom.getAttribute('data-gridEnabled')
                const readOnlyEnabled = dom.getAttribute('data-readOnlyEnabled')
                return {
                    width: width ? width : 800,
                    height: height ? height : 500,
                    data: data ? data : DEFAULT_EXCALIDRAW_DATA,
                    zenEnabled: zenEnabled ? zenEnabled : false,
                    gridEnabled: gridEnabled ? gridEnabled : false,
                    readOnlyEnabled: readOnlyEnabled ? readOnlyEnabled : false
                }
            }
        }
    ]
} as NodeSpec
