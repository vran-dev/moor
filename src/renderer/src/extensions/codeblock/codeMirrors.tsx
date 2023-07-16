import { StateField, StateEffect, Transaction, Range } from '@codemirror/state'
import { Decoration, DecorationSet, EditorView } from '@codemirror/view'

const classEffect = StateEffect.define<{ from: number; to: number }>({
  map: ({ from, to }, change) => ({ from: change.mapPos(from), to: change.mapPos(to) })
})

export interface EffectRange {
  from: number
  to: number
}

export const classEffectEvent = 'class.effect.event'

export function replaceClassEffects(
  view: EditorView,
  ranges: EffectRange[],
  classes: string[]
): boolean {
  const effects: StateEffect<unknown>[] = ranges.map(({ from, to }) => classEffect.of({ from, to }))
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
          const classStr = classes.join(' ')
          decorations.push(Decoration.mark({ class: classStr }).range(e.value.from, e.value.to))
        }
      return Decoration.set(decorations)
    },
    provide: (f) => EditorView.decorations.from(f)
  })

  if (!view.state.field(classEffectField, false)) {
    effects.push(StateEffect.appendConfig.of([classEffectField]))
  }
  view.dispatch({ effects: effects, userEvent: classEffectEvent })
  return true
}
