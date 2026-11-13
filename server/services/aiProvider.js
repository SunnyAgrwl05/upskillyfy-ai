function providerError(message, code = 'AI_PROVIDER_UNAVAILABLE', status = 503) {
  return Object.assign(new Error(message), { status, code })
}

function parseJson(content) {
  const raw = typeof content === 'string'
    ? content
    : Array.isArray(content)
      ? content.map((part) => part?.text || '').join('')
      : ''

  const cleaned = raw.trim().replace(/^\uFEFF/, '').replace(/^\x60{3}(?:json)?\s*/i, '').replace(/\s*\x60{3}$/, '')
  if (!cleaned) throw providerError('The AI provider returned an empty response.', 'AI_INVALID_JSON', 502)

  try {
    return JSON.parse(cleaned)
  } catch {
    throw providerError('The AI provider returned invalid JSON.', 'AI_INVALID_JSON', 502)
  }
}

function correctionMessages(messages) {
  return [
    ...messages,
    {
      role: 'user',
      content: 'Your previous response was not valid JSON. Return one complete, syntactically valid JSON object matching the requested fields. Do not use Markdown fences or commentary. Do not invent or omit information; use empty strings and arrays when data is absent.',
    },
  ]
}

async function callGemini(model, messages, apiKey, fetchImpl) {
  const contents = messages.filter((item) => item.role !== 'system').map((item) => ({
    role: item.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(item.content) }],
  }))
  const systemInstruction = messages.filter((item) => item.role === 'system').map((item) => item.content).join('\n\n')
  const response = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(55_000),
    body: JSON.stringify({
      ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
      contents,
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
    }),
  })
  if (!response.ok) throw providerError(`Gemini ${model} returned HTTP ${response.status}.`)
  const payload = await response.json()
  const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('')
  return parseJson(text)
}

async function callOpenAICompatible({ endpoint, apiKey, model, messages, fetchImpl, headers = {}, openRouter = false }) {
  const response = await fetchImpl(`${endpoint.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', ...headers },
    signal: AbortSignal.timeout(35_000),
    body: JSON.stringify({
      model, temperature: 0.1, response_format: { type: 'json_object' }, messages,
      ...(openRouter ? { provider: { allow_fallbacks: false } } : {}),
    }),
  })
  if (!response.ok) {
    const errorBody = await response.text()
    if (response.status === 400 && /failed to validate json|failed_generation/i.test(errorBody)) {
      throw providerError('The provider could not generate valid JSON.', 'AI_INVALID_JSON', 502)
    }
    throw providerError(`AI provider returned HTTP ${response.status}.`)
  }
  const payload = await response.json()
  return parseJson(payload?.choices?.[0]?.message?.content)
}

export async function requestJsonCompletion(messages, { fetchImpl = globalThis.fetch } = {}) {
  const providers = []
  if (process.env.GEMINI_API_KEY) {
    providers.push(
      { name: 'Gemini Flash', run: (input) => callGemini(process.env.GEMINI_MODEL || 'gemini-2.5-flash', input, process.env.GEMINI_API_KEY, fetchImpl) },
      { name: 'Gemini Flash-Lite', run: (input) => callGemini(process.env.GEMINI_BACKUP_MODEL || 'gemini-2.5-flash-lite', input, process.env.GEMINI_API_KEY, fetchImpl) },
    )
  }
  if (process.env.GROQ_API_KEY) {
    providers.push({ name: 'Groq', run: (input) => callOpenAICompatible({
      endpoint: 'https://api.groq.com/openai/v1', apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b', messages: input, fetchImpl,
    }) })
  }
  if (process.env.OPENROUTER_API_KEY) {
    providers.push({ name: 'OpenRouter', run: (input) => callOpenAICompatible({
      endpoint: 'https://openrouter.ai/api/v1', apiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || 'openrouter/free', messages: input, fetchImpl,
      headers: { 'HTTP-Referer': process.env.CLIENT_URL || 'https://upskillyfy-ai.tech', 'X-Title': 'Upskillyfy AI Resume Analyzer' },
      openRouter: true,
    }) })
  }
  if (process.env.OPENAI_API_KEY) {
    providers.push({ name: 'OpenAI', run: (input) => callOpenAICompatible({
      endpoint: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1', apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini', messages: input, fetchImpl,
    }) })
  }
  if (!providers.length) throw providerError('AI resume analysis is not configured. Add a supported AI provider API key to the server environment.', 'AI_UNAVAILABLE')

  const failures = []
  for (const provider of providers) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await provider.run(attempt === 0 ? messages : correctionMessages(messages))
      } catch (error) {
        if (error?.code === 'AI_INVALID_JSON' && attempt === 0) {
          console.warn(`[AI] ${provider.name} returned invalid JSON; retrying once.`)
          continue
        }
        failures.push(`${provider.name}: ${error?.code || error?.message || 'request failed'}`)
        break
      }
    }
  }
  throw providerError(`All configured AI providers failed. ${failures.join('; ')}`)
}
