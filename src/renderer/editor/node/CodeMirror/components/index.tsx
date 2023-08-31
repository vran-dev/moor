import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    defaultKeymap,
    history,
    indentWithTab,
    historyKeymap
} from '@codemirror/commands'
import {
    bracketMatching,
    defaultHighlightStyle,
    foldGutter,
    indentOnInput,
    syntaxHighlighting
} from '@codemirror/language'
import {
    Compartment,
    Extension as CodeMirrorExtension
} from '@codemirror/state'
import {
    EditorView as CodeMirrorEditorView,
    KeyBinding as CodeMirrorKeyBinding,
    ViewUpdate,
    keymap,
    lineNumbers
} from '@codemirror/view'
import { autocompletion, closeBrackets } from '@codemirror/autocomplete'
import './index.css'
import {
    LanguageInfo,
    languageInfos,
    languageMatch,
    listLanguages
} from '../language'
import { KeyBridgeMapping } from '../util/aroowKeyMapping'
import { Layout } from './LayoutSelect/layout'
import { VirtualSelect } from '@renderer/ui/Select'
import { LayoutSelect } from './LayoutSelect'
import { CopyButton } from './CopyButton'
import { LineWrapButton } from './LineWrapButton'
import { EditorView } from 'prosemirror-view'
import { Node } from 'prosemirror-model'
import { CodeMirrorNodeAttrs } from '../NodeView'
import { githubLightInit } from '@uiw/codemirror-theme-github'
import { updateNodeAttributesPartial } from '@renderer/editor/util/NodeAttributeUtils'
import { CodePreview } from './CodePreview'
import { FormatButton, canFormat } from './FormatButton'

export interface LanguageOption extends LanguageInfo {
    value: string
    label: string
}

export function CodeMirrorComponent(props: {
    node: Node
    view: EditorView
    getPos: () => number | undefined
}): JSX.Element {
    const [codeMirror, setCodeMirror] = useState<CodeMirrorEditorView | null>()
    const editorRef = useRef<HTMLDivElement>(null)
    const pmNodeAttrs: CodeMirrorNodeAttrs = props.node.attrs

    const selectedLanguage: LanguageOption = useMemo(() => {
        if (pmNodeAttrs.language) {
            const matchedLanges = listLanguages({
                query: pmNodeAttrs.language,
                nameFullMatch: true
            })
            if (matchedLanges.length > 0) {
                const option = {
                    label: matchedLanges[0].name,
                    value: matchedLanges[0].name,
                    ...matchedLanges[0]
                }
                return option
            }
        }
        return null
    }, [pmNodeAttrs.language])

    const languageCompartment = useMemo(() => new Compartment(), [])
    const lineWrapCompartment = useMemo(() => new Compartment(), [])
    const languageOptions = useMemo(() => {
        return languageInfos.map((item, index) => {
            return {
                value: item.name,
                label: item.name,
                ...item
            }
        })
    }, [])

    useEffect(() => {
        if (!languageCompartment || !codeMirror) {
            return
        }
        const langInfo = selectedLanguage
        const updateLanguage = (languageSupport: CodeMirrorExtension): void => {
            codeMirror?.dispatch({
                effects: languageCompartment.reconfigure(languageSupport)
            })
        }

        if (langInfo?.codeMirrorLanguage) {
            if (langInfo.codeMirrorLanguage.support) {
                updateLanguage(langInfo?.codeMirrorLanguage?.support)
            } else {
                langInfo.codeMirrorLanguage.load().then((language) => {
                    updateLanguage(language)
                })
            }
        } else {
            updateLanguage([])
        }
    }, [pmNodeAttrs.language, codeMirror, languageCompartment])

    const onLanguageChange = useCallback((option: LanguageOption) => {
        updateNodeAttributesPartial(props.view, props.getPos, {
            language: option.value
        })
    }, [])

    useEffect(() => {
        if (!editorRef.current) {
            return
        }
        const codeMirrorKeymap = (): CodeMirrorKeyBinding[] => {
            return [...KeyBridgeMapping(props.view, props.node, props.getPos)]
        }
        const changeFilter = CodeMirrorEditorView.updateListener.of(
            (update: ViewUpdate) => {
                if (update.docChanged) {
                    const { doc } = update.view.state.toJSON() || {}
                    updateNodeAttributesPartial(props.view, props.getPos, {
                        data: doc || ''
                    })
                }
            }
        )
        const codeMirror = new CodeMirrorEditorView({
            doc: pmNodeAttrs.data,
            extensions: [
                keymap.of([
                    indentWithTab,
                    ...historyKeymap,
                    ...defaultKeymap,
                    ...codeMirrorKeymap()
                ]),
                history(),
                indentOnInput(),
                autocompletion(),
                foldGutter(),
                // highlightActiveLine(),
                // drawSelection(),
                lineNumbers(),
                closeBrackets(),
                bracketMatching(),
                syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
                githubLightInit({
                    settings: {
                        background: 'transpanret',
                        gutterBackground: '#fbfbfb',
                        selection: 'default'
                    }
                }),
                languageCompartment.of([]),
                pmNodeAttrs.lineWrap
                    ? lineWrapCompartment.of([
                          CodeMirrorEditorView.lineWrapping
                      ])
                    : lineWrapCompartment.of([]),
                changeFilter
            ]
        })
        setCodeMirror(codeMirror)
        return () => {
            codeMirror.destroy()
        }
    }, [])

    // append codemirror to root dom
    useEffect(() => {
        if (codeMirror && editorRef) {
            editorRef.current?.appendChild(codeMirror.dom)
        }
        return () => {
            if (codeMirror && editorRef) {
                if (editorRef.current?.contains(codeMirror.dom)) {
                    editorRef.current?.removeChild(codeMirror.dom)
                }
            }
        }
    }, [codeMirror, pmNodeAttrs.layout])

    const onLayoutChange = useCallback(
        (value: string) => {
            updateNodeAttributesPartial(props.view, props.getPos, {
                layout: value
            })
        },
        [pmNodeAttrs.layout]
    )

    const shouldShowCodeData = useCallback(() => {
        if (pmNodeAttrs.layout !== Layout.Preview) {
            return true
        }
        if (selectedLanguage === null) {
            return true
        }
        return !selectedLanguage.preview
    }, [pmNodeAttrs.layout, pmNodeAttrs.language])

    const shouldShowCodePreview = useCallback(() => {
        if (pmNodeAttrs.layout === Layout.Code) {
            return false
        }
        if (selectedLanguage === null || !selectedLanguage.preview) {
            return false
        }
        return true
    }, [pmNodeAttrs.layout, pmNodeAttrs.language])

    return (
        <div className="codeblock-container" draggable={true}>
            <div className="codeblock-main">
                <div className="codeblock-tool-menu">
                    <VirtualSelect
                        options={languageOptions}
                        onSelect={(option): void => onLanguageChange(option)}
                        defaultIndex={languageOptions.findIndex(
                            (item) => item.value === pmNodeAttrs.language
                        )}
                        filter={(inputValue, option): boolean =>
                            languageMatch(inputValue, false, option)
                        }
                        mainMinWidth="200px"
                    />
                    {selectedLanguage && selectedLanguage.preview && (
                        <LayoutSelect
                            onChange={(option): void =>
                                onLayoutChange(option.value)
                            }
                            layout={pmNodeAttrs.layout}
                        />
                    )}

                    {codeMirror && (
                        <>
                            <CopyButton codeMirror={codeMirror} />
                            <LineWrapButton
                                codeMirror={codeMirror}
                                lineWrapCompartMent={lineWrapCompartment}
                                defaultValue={pmNodeAttrs.lineWrap || false}
                                onChange={(value): void =>
                                    updateNodeAttributesPartial(
                                        props.view,
                                        props.getPos,
                                        {
                                            lineWrap: value
                                        }
                                    )
                                }
                            />
                            {selectedLanguage &&
                                canFormat(
                                    selectedLanguage.name.toLocaleLowerCase()
                                ) && (
                                    <FormatButton
                                        codeMirror={codeMirror}
                                        lang={selectedLanguage?.name}
                                    />
                                )}
                        </>
                    )}
                </div>
                {
                    <div
                        className="codeblock-editor"
                        ref={editorRef}
                        style={{
                            display: shouldShowCodeData() ? 'block' : 'none'
                        }}
                    ></div>
                }
            </div>
            {shouldShowCodePreview() && (
                <CodePreview
                    language={selectedLanguage}
                    data={pmNodeAttrs.data}
                />
            )}
        </div>
    )
}
