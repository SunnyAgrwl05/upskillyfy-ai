/** RFC 4180 quoting plus spreadsheet formula neutralization. */
export function csvCell(value) {
  let text = String(value ?? '')
  const firstMeaningful = text.replace(/^[\s\u0000-\u001f\u007f]+/, '')
  if (/^[=+@-]/.test(firstMeaningful)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}
