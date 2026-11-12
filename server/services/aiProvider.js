function providerError(message, code = 'AI_PROVIDER_UNAVAILABLE', status = 503) {
  return Object.assign(new Error(message), { status, code })
}

function parseJson(text) {
  try { return JSON.parse(text) } catch {
    throw providerError('The AI provider returned an invalid response. No analysis was saved.', 'AI_INVALID_RESPONSE', 502)
  }
}

async function callGemini(model, messages, apiKey, fetchImpl) {
  const contents = messages.filter((item) => item.role !== 'system').map((item) => ({
    role: item.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: item.content }],
  }))
  const systemInstruction = messages.find((item) => item.role === 'system')?.content
  const response = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(25_000),
    body: JSON.stringify({
      ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
      contents,
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
    }),
  })
  if (!response.ok) throw providerError(`Gemini ${model} returned HTTP ${response.status}.`)
  const payload = await response.json()
  const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('')
  if (!text) throw providerError('Gemini returned an empty response.')
  return parseJson(text)
}

async function callOpenAICompatible({ endpoint, apiKey, model, messages, fetchImpl, headers = {}, openRouter = false }) {
  const response = await fetchImpl(`${endpoint.replace(/\\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', ...headers },
    signal: AbortSignal.timeout(25_000),
    body: JSON.stringify({
      model, temperature: 0.1, response_format: { type: 'json_object' }, messages,
      ...(openRouter ? { provider: { allow_fallbacks: false } } : {}),
    }),
  })
  if (!response.ok) throw providerError(`AI provider returned HTTP ${response.status}.`)
  const payload = await response.json()
  const content = payload?.choices?.[0]?.message?.content
  const rawText = typeof content === 'string' ? content : Array.isArray(content) ? content.map((part) => part?.text || '').join('') : ''
  if (!rawText) throw providerError('AI provider returned an empty response.')
  return parseJson(rawText)
}

export async function requestJsonCompletion(messages, { fetchImpl = globalThis.fetch } = {}) {
  const providers = []
  if (process.env.GEMINI_API_KEY) {
    providers.push(
      { name: 'Gemini Flash', run: () => callGemini(process.env.GEMINI_MODEL || 'gemini-2.5-flash', messages, process.env.GEMINI_API_KEY, fetchImpl) },
      { name: 'Gemini Flash-Lite', run: () => callGemini(process.env.GEMINI_BACKUP_MODEL || 'gemini-2.5-flash-lite', messages, process.env.GEMINI_API_KEY, fetchImpl) },
    )
  }
  if (process.env.GROQ_API_KEY) {
    providers.push({ name: 'Groq', run: () => callOpenAICompatible({
      endpoint: 'https://api.groq.com/openai/v1', apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b', messages, fetchImpl,
    }) })
  }
  if (process.env.OPENROUTER_API_KEY) {
    providers.push({ name: 'OpenRouter', run: () => callOpenAICompatible({
      endpoint: 'https://openrouter.ai/api/v1', apiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || 'openrouter/free', messages, fetchImpl,
      headers: { 'HTTP-Referer': process.env.CLIENT_URL || 'https://upskillyfy-ai.tech', 'X-Title': 'Upskillyfy AI Resume Analyzer' },
      openRouter: true,
    }) })
  }
  if (process.env.OPENAI_API_KEY) {
    providers.push({ name: 'OpenAI', run: () => callOpenAICompatible({
      endpoint: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1', apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini', messages, fetchImpl,
    }) })
  }
  if (!providers.length) throw providerError('AI resume analysis is not configured. Add a supported AI provider API key to the server environment.', 'AI_UNAVAILABLE')
  const failures = []
  for (const provider of providers) {
    try {
      return await provider.run()
    } catch (error) {
      failures.push(`${provider.name}: ${error?.code || error?.message || 'request failed'}`)
    }
  }
  throw providerError(`All configured AI providers failed. ${failures.join('; ')}`)
}
