import { StateField, StateEffect, Transaction, Range, EditorSelection } from '@codemirror/state'
import { Decoration, DecorationSet, EditorView } from '@codemirror/view'

const classEffect = StateEffect.define<{ from: number; to: number; className: string }>({
  map: ({ from, to, className }, change) => ({
    from: change.mapPos(from),
    to: change.mapPos(to),
    className: className
  })
})

export interface EffectRange {
  from: number
  to: number
  className: string
}

export const classEffectEvent = 'class.effect.event'

export function replaceClassEffects(view: EditorView, ranges: EffectRange[]): boolean {
  const effects: StateEffect<unknown>[] = ranges.map(({ from, to, className }) =>
    classEffect.of({ from, to, className })
  )
  if (!effects.length) {
    view.dispatch({ effects: effects, userEvent: classEffectEvent })
    return false
  }

  const classEffectField = StateField.define<DecorationSet>({
    create() {
      return Decoration.none
    },
    update(underlines: DecorationSet, tr: Transaction) {
      if (!tr.isUserEvent(classEffectEvent)) {
        return underlines.map(tr.changes)
      }
      const decorations: Range<Decoration>[] = []
      for (const e of tr.effects)
        if (e.is(classEffect)) {
          decorations.push(
            Decoration.mark({ class: e.value.className }).range(e.value.from, e.value.to)
          )
        }
      return Decoration.set(decorations)
    },
    provide: (f) => EditorView.decorations.from(f)
  })

  if (!view.state.field(classEffectField, false)) {
    effects.push(StateEffect.appendConfig.of([classEffectField]))
  }
  view.dispatch({ effects: effects, userEvent: classEffectEvent })
  // scroll to where class is 'active'
  const activeClass = ranges.find(
    (range) => range.className && range.className.includes('search-match active')
  )
  if (activeClass) {
    const scrollEffect = EditorView.scrollIntoView(
      EditorSelection.range(activeClass.from, activeClass.to),
      { xMargin: 100, yMargin: 100 }
    )
    view.dispatch({ effects: [scrollEffect] })
  }
  return true
}
