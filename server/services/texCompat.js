export function compatTex(filePath, source) {
  if (typeof source !== 'string' || !/\.(tex|sty|cls)$/i.test(filePath)) return source
  return source
    .replace(/^([ \t]*)\\input\{glyphtounicode\}[ \t]*(?:%.*)?$/gm, '$1\\ifdefined\\pdfgentounicode\\input{glyphtounicode}\\fi')
    .replace(/^([ \t]*)\\pdfgentounicode[ \t]*=[ \t]*1[ \t]*(?:%.*)?$/gm, '$1\\ifdefined\\pdfgentounicode\\pdfgentounicode=1 \\fi')
}
