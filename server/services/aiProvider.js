export async function requestJsonCompletion(messages, { fetchImpl = globalThis.fetch } = {}) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw Object.assign(new Error('AI resume analysis is not configured. Please try again later.'), { status: 503, code: 'AI_UNAVAILABLE' })
  const endpoint = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '')
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  let response
  try {
    response = await fetchImpl(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(25_000),
      body: JSON.stringify({ model, temperature: 0.1, response_format: { type: 'json_object' }, messages }),
    })
  } catch {
    throw Object.assign(new Error('The AI analysis provider could not be reached. Your PDF was not stored; please try again.'), { status: 503, code: 'AI_PROVIDER_UNAVAILABLE' })
  }
  if (!response.ok) {
    throw Object.assign(new Error('The AI analysis provider is temporarily unavailable. Your PDF was not stored; please try again.'), { status: 503, code: 'AI_PROVIDER_UNAVAILABLE' })
  }
  let payload
  try { payload = await response.json() } catch {
    throw Object.assign(new Error('The AI provider returned an invalid response. No analysis was saved.'), { status: 502, code: 'AI_INVALID_RESPONSE' })
  }
  const content = payload?.choices?.[0]?.message?.content
  const rawText = typeof content === 'string' ? content : Array.isArray(content) ? content.map((part) => part?.text || '').join('') : ''
  try { return JSON.parse(rawText) } catch {
    throw Object.assign(new Error('The AI provider returned an invalid response. No analysis was saved.'), { status: 502, code: 'AI_INVALID_RESPONSE' })
  }
}
