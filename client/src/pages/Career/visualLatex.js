import { Decoration, ViewPlugin, WidgetType, EditorView } from '@codemirror/view'
import { RangeSetBuilder } from '@codemirror/state'

// Visual mode: formats LaTeX while you read (headings, bold, bullets, links) and shows
// the raw source on the line your cursor is on. The document text is never changed.
class TextWidget extends WidgetType {
  constructor(text, cls) { super(); this.text = text; this.cls = cls }
  eq(other) { return other.text === this.text && other.cls === this.cls }
  toDOM() { const s = document.createElement('span'); s.className = this.cls; s.textContent = this.text; return s }
}

const hide = Decoration.replace({})
const bullet = Decoration.replace({ widget: new TextWidget('•  ', 'cmv-bullet') })
const gap = Decoration.replace({ widget: new TextWidget('\u2003\u2003', 'cmv-gap') })
const mark = (cls) => Decoration.mark({ class: cls })
const dim = mark('cmv-dim')
const isAtomic = (d) => d === hide || d === bullet || d === gap

const SECTION = /^(\s*)\\(part|chapter|section|subsection|subsubsection)(\*?)\{([^{}]*)\}/
const LEVEL = { part: 'cmv-h1', chapter: 'cmv-h1', section: 'cmv-h1', subsection: 'cmv-h2', subsubsection: 'cmv-h3' }
const INLINE = /\\(textbf|textit|emph|underline|texttt|textsc)\{([^{}]*)\}/g
const INLINE_CLASS = { textbf: 'cmv-b', textit: 'cmv-i', emph: 'cmv-i', underline: 'cmv-u', texttt: 'cmv-tt', textsc: 'cmv-sc' }
const HREF = /\\href\{([^{}]*)\}\{([^{}]*)\}/g
const ENV = /^\s*\\(?:begin|end)\{(?:itemize|enumerate|center|flushleft|flushright)\}(?:\[[^\]]*\])?\s*$/

// Pure function: decoration items for one line of text.
export function lineItems(text, offset, preamble) {
  const items = []
  if (/^\s*%/.test(text) || preamble || ENV.test(text)) {
    if (text.length) items.push({ from: offset, to: offset + text.length, deco: dim })
    return items
  }
  const sec = text.match(SECTION)
  if (sec) {
    const start = offset + sec[1].length
    const openEnd = start + 1 + sec[2].length + sec[3].length + 1
    const contentEnd = openEnd + sec[4].length
    items.push({ from: start, to: openEnd, deco: hide }, { from: openEnd, to: contentEnd, deco: mark(LEVEL[sec[2]]) }, { from: contentEnd, to: contentEnd + 1, deco: hide })
  }
  const item = text.match(/^(\s*)\\item\b ?/)
  if (item) items.push({ from: offset + item[1].length, to: offset + item[0].length, deco: bullet })
  for (const m of text.matchAll(INLINE)) {
    const open = m.index + 1 + m[1].length + 1
    const end = open + m[2].length
    items.push({ from: offset + m.index, to: offset + open, deco: hide }, { from: offset + open, to: offset + end, deco: mark(INLINE_CLASS[m[1]]) }, { from: offset + end, to: offset + end + 1, deco: hide })
  }
  for (const m of text.matchAll(HREF)) {
    const open = m.index + 6 + m[1].length + 2
    const end = open + m[2].length
    items.push({ from: offset + m.index, to: offset + open, deco: hide }, { from: offset + open, to: offset + end, deco: mark('cmv-link') }, { from: offset + end, to: offset + end + 1, deco: hide })
  }
  for (const m of text.matchAll(/\\hfill\b ?/g)) items.push({ from: offset + m.index, to: offset + m.index + m[0].length, deco: gap })
  return items
}

// Pure function: sort, drop overlaps and empty ranges.
export function cleanItems(items) {
  items.sort((a, b) => a.from - b.from || a.to - b.to)
  const out = []
  let last = -1
  for (const it of items) {
    if (it.from < last || it.to <= it.from) continue
    out.push(it)
    last = it.to
  }
  return out
}

function build(view) {
  const doc = view.state.doc
  const sel = view.state.selection.main
  const head = doc.sliceString(0, Math.min(doc.length, 200000))
  const found = /\\begin\{document\}/.exec(head)
  const docStart = found ? found.index : -1
  const items = []
  const seen = new Set()
  for (const { from, to } of view.visibleRanges) {
    let pos = from
    while (pos <= to) {
      const line = doc.lineAt(pos)
      pos = line.to + 1
      if (seen.has(line.number)) continue
      seen.add(line.number)
      if (sel.from <= line.to && sel.to >= line.from) continue
      items.push(...lineItems(line.text, line.from, docStart >= 0 && line.to < docStart))
    }
  }
  const all = new RangeSetBuilder()
  const atomic = new RangeSetBuilder()
  for (const it of cleanItems(items)) {
    all.add(it.from, it.to, it.deco)
    if (isAtomic(it.deco)) atomic.add(it.from, it.to, it.deco)
  }
  return { all: all.finish(), atomic: atomic.finish() }
}

export const visualLatex = ViewPlugin.fromClass(class {
  constructor(view) { const b = build(view); this.decorations = b.all; this.atomic = b.atomic }
  update(u) {
    if (u.docChanged || u.selectionSet || u.viewportChanged) { const b = build(u.view); this.decorations = b.all; this.atomic = b.atomic }
  }
}, {
  decorations: (v) => v.decorations,
  provide: (p) => EditorView.atomicRanges.of((view) => (view.plugin(p) ? view.plugin(p).atomic : Decoration.none)),
})
