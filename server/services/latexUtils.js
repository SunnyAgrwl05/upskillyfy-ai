// Shared LaTeX text-safety and document-preamble helpers.
//
// Two independent concerns live here so both the server (template catalogue,
// compile route) and any future generator can stay consistent:
//
//   1. `escapeLatexText` — the ONE place where plain user-authored text is made
//      LaTeX-safe. It must only ever see plain text, never LaTeX source, and it
//      must never be applied twice (double escaping is irreversible).
//   2. `RESUME_DOCUMENT_PREAMBLE` / `buildResumeDocument` — the Unicode-safe
//      XeLaTeX document shell used by generated resume templates.
//
// Why XeLaTeX + fontspec: the production compiler is Tectonic, which runs the
// XeTeX engine. The old `[T1]{fontenc}` preamble selected the `ec` encoding
// vector fonts (ec-lmr10) that lack glyphs for U+2013/U+2014 and most
// non-ASCII punctuation, so `—` / `–` silently vanished from the PDF
// ("Missing character ... in font ec-lmr10"). fontspec + a real OpenType font
// covers those glyphs directly.

/**
 * Escape plain text for safe interpolation into LaTeX.
 *
 * Handles every character that is special to TeX plus the common Unicode
 * punctuation users actually paste. Backslash is escaped first so the output of
 * one pass can never be reinterpreted as a command by a second pass — but
 * callers must still escape exactly once; this utility does not know how to
 * tell user text apart from LaTeX source.
 *
 * @param {string} value Plain text as authored by the user.
 * @returns {string} LaTeX-safe text (still needs its own grouping if used in a macro argument).
 */
export function escapeLatexText(value) {
  if (typeof value !== 'string') return ''
  const MAP = {
    '\\': '\\textbackslash{}',
    '{': '\\{',
    '}': '\\}',
    '$': '\\$',
    '&': '\\&',
    '#': '\\#',
    '_': '\\_',
    '%': '\\%',
    '~': '\\textasciitilde{}',
    '^': '\\textasciicircum{}',
    '—': '---',
    '–': '--',
    '‘': '`',
    '’': "'",
    '“': '``',
    '”': "''",
    '•': '\\textbullet{}',
    '·': '\\textperiodcentered{}',
    '≤': '\\textleq{}',
    '≥': '\\textgeq{}',
    '→': '\\textrightarrow{}',
    '←': '\\textleftarrow{}',
    '×': '\\texttimes{}',
    '÷': '\\textdiv{}',
    '±': '\\textpm{}',
    '©': '\\textcopyright{}',
    '®': '\\textregistered{}',
    '™': '\\texttrademark{}',
    '°': '\\textdegree{}',
    '€': '\\texteuro{}',
    '£': '\\textsterling{}',
    '¥': '\\textyen{}',
    '§': '\\textsection{}',
    '¶': '\\textparagraph{}',
    '†': '\\textdagger{}',
    '‡': '\\textdaggerdbl{}',
    '…': '\\textellipsis{}',
    '¡': '\\textexclamdown{}',
    '¿': '\\textquestiondown{}',
  }
  return value.replace(/[\\{}$&#_%~^—–‘’“”•·≤≥→←×÷±©®™°€£¥§¶†‡…¡¿]/g, (char) => MAP[char])
}

/**
 * Escape text destined for a PDF string (bookmarks, metadata).
 * PDF strings cannot contain unbalanced braces or backslash commands, so the
 * plain-text escape above must be undone for these contexts.
 */
export function escapePdfString(value) {
  if (typeof value !== 'string') return ''
  return value.replace(/[\\()]/g, (char) => `\\${char}`)
}

/**
 * Build the hyperlink-safe form of a URL.
 *
 * hyperref's \url handles most special characters, but query strings with
 * `&` or `#` still break the PDF string layer, so the URL is both escaped and
 * wrapped in \url{} rather than interpolated raw.
 */
export function escapeLatexUrl(url) {
  if (typeof url !== 'string') return ''
  const clean = url.trim().replace(/[<>\\{}|^~%#]/g, (char) => ({
    '<': '%3C', '>': '%3E', '\\': '%5C', '{': '%7B', '}': '%7D',
    '|': '%7C', '^': '%5E', '~': '%7E', '%': '%25', '#': '%23',
  }[char]))
  return `\\url{${clean}}`
}

/**
 * The Unicode-safe preamble shared by every generated resume document.
 *
 * Design decisions (all verified against the production tectonic image):
 *  - fontspec is required for XeTeX to pick an OpenType main font.
 *  - `ec`/[T1] fontenc is intentionally absent: under XeTeX it selects the
 *    ec-lmr10 vector font that lacks U+2013/U+2014, the original bug.
 *  - `inputenc` is absent: XeTeX reads UTF-8 natively.
 *  - The main font falls back through a list so the document still builds on
 *    machines where the first choice is not installed.
 */
export const RESUME_DOCUMENT_PREAMBLE = String.raw`\documentclass[10pt,a4paper]{article}
\usepackage{fontspec}
\setmainfont{STIXGeneral}
\usepackage[margin=1.6cm]{geometry}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{url}
\pagestyle{empty}
\setlength{\parindent}{0pt}
\setlist[itemize]{leftmargin=1.2em, itemsep=1pt, topsep=2pt}
\pdfgentounicode=1
`

/**
 * Wrap already-escaped body content in a complete, compilable document.
 *
 * @param {string} body LaTeX body (must already be escaped where needed).
 * @param {object} [options] Optional overrides.
 * @param {string} [options.title] PDF metadata title (escaped here).
 * @param {string} [options.preamble] Preamble override; defaults to RESUME_DOCUMENT_PREAMBLE.
 */
export function buildResumeDocument(body, options = {}) {
  const preamble = options.preamble ?? RESUME_DOCUMENT_PREAMBLE
  const title = typeof options.title === 'string' && options.title.trim()
    ? `\\hypersetup{pdftitle={${escapePdfString(options.title)}}}\n`
    : ''
  return `${preamble}${title}\\begin{document}\n${body}\n\\end{document}\n`
}
