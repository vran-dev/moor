/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { EditorView } from '@codemirror/view'
import { Options } from 'prettier'
import { BsMagic } from 'react-icons/bs'
import * as prettier from 'prettier'
import { format } from 'sql-formatter'

interface CodeFormatter {
    format: (source: string, language: string) => Promise<string>
}

async function formateByPrettier(
    content: string,
    parserName: string,
    pluginLoader?: () => Promise<Array<any>>
): Promise<string> {
    const options: Options = {
        parser: parserName
    }
    if (pluginLoader) {
        const langModule = await pluginLoader()
        options.plugins = [...langModule]
        return prettier.format(content, options)
    } else {
        throw new Error('not supported to format this language: ' + parserName)
    }
}

const FORMATTER_BY_LANG: Record<string, CodeFormatter> = {
    css: {
        format(source, language) {
            return formateByPrettier(source, language, async () => [
                await import('prettier/plugins/postcss')
            ])
        }
    },
    scss: {
        format(source, language) {
            return formateByPrettier(source, language, async () => [
                await import('prettier/plugins/postcss')
            ])
        }
    },
    less: {
        format(source, language) {
            return formateByPrettier(source, language, async () => [
                await import('prettier/plugins/postcss')
            ])
        }
    },
    html: {
        format(source, language) {
            return formateByPrettier(source, language, async () => [
                await import('prettier/plugins/html')
            ])
        }
    },
    vue: {
        format(source, language) {
            return formateByPrettier(source, language, async () => [
                await import('prettier/plugins/html')
            ])
        }
    },
    angular: {
        format(source, language) {
            return formateByPrettier(source, language, async () => [
                await import('prettier/plugins/angular')
            ])
        }
    },
    jsx: {
        format(source, language) {
            return formateByPrettier(source, 'babel', async () => [
                await import('prettier/plugins/babel'),
                await import('prettier/plugins/estree')
            ])
        }
    },
    javascript: {
        async format(source, language) {
            return formateByPrettier(source, 'babel', async () => [
                await import('prettier/plugins/babel'),
                await import('prettier/plugins/estree')
            ])
        }
    },
    typescript: {
        async format(source, language) {
            return formateByPrettier(source, language, async () => [
                await import('prettier/plugins/typescript'),
                await import('prettier/plugins/estree')
            ])
        }
    },
    yaml: {
        format(source, language) {
            return formateByPrettier(source, language, async () => [
                await import('prettier/plugins/yaml')
            ])
        }
    },
    markdown: {
        format(source, language) {
            return formateByPrettier(source, language, async () => [
                await import('prettier/plugins/markdown')
            ])
        }
    },
    json: {
        format(source, language) {
            return Promise.resolve(JSON.stringify(JSON.parse(source), null, 2))
        }
    },
    java: {
        format(source, language) {
            return formateByPrettier(source, language, async () => [
                await import('prettier-plugin-java')
            ])
        }
    },
    sql: {
        format(source, language) {
            return Promise.resolve(format(source, { language: language }))
        }
    },
    postgresql: {
        format(source, language) {
            return Promise.resolve(format(source, { language: language }))
        }
    },
    mysql: {
        format(source, language) {
            return Promise.resolve(format(source, { language: language }))
        }
    },
    sqllite: {
        format(source, language) {
            return Promise.resolve(format(source, { language: language }))
        }
    },
    plsql: {
        format(source, language) {
            return Promise.resolve(format(source, { language: language }))
        }
    },
    mssql: {
        format(source, language) {
            return Promise.resolve(format(source, { language: 'sql' }))
        }
    },

    'mariadb sql': {
        format(source, language) {
            return Promise.resolve(format(source, { language: 'mariadb' }))
        }
    },
    xml: {
        async format(source, language) {
            const { format } = await import('prettier/standalone')
            const xmlModule = await import('@prettier/plugin-xml')
            const options: Options = {
                parser: language,
                plugins: [xmlModule.default]
            }
            return format(source, options)
        }
    }
} as const

const LANG_CAN_BE_PRETTIER = Object.keys(FORMATTER_BY_LANG)

export function canFormat(lang: string): boolean {
    return LANG_CAN_BE_PRETTIER.includes(lang)
}

export function FormatButton(props: {
    codeMirror: EditorView
    lang: string
}): JSX.Element {
    const { codeMirror, lang } = props
    const format = async (): Promise<void> => {
        const content = codeMirror.state.doc.toString()
        const language = lang.toLowerCase()
        const formatter = FORMATTER_BY_LANG[language]
        if (!formatter) {
            console.log('not supported to format this language: ' + language)
            return
        }
        const parsed = formatter.format(content, language)
        return parsed.then((result) => {
            codeMirror.dispatch({
                changes: {
                    from: 0,
                    to: codeMirror.state.doc.length,
                    insert: result
                }
            })
        })
    }
    return (
        <>
            <button onClick={() => format()} className="code-tool-button">
                {<BsMagic />}
            </button>
        </>
    )
}
