import { env } from '../../config/env.js'

export default class OpenRouterProvider {
  constructor() {
    this.name = 'openrouter'
  }

  get configured() {
    return Boolean(env.OPENROUTER_API_KEY)
  }

  async generateJson({ system, user }) {
    if (!this.configured) throw new Error('OpenRouter is not configured.')
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': env.CLIENT_URL,
        'X-Title': 'Upskillyfy AI Resume Analyzer',
      },
      body: JSON.stringify({
        model: env.OPENROUTER_MODEL,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      }),
      signal: AbortSignal.timeout(env.OLLAMA_TIMEOUT_MS),
    })
    if (!response.ok) throw Object.assign(new Error(`OpenRouter request failed (${response.status}).`), { status: response.status })
    const payload = await response.json()
    const content = payload.choices?.[0]?.message?.content
    if (typeof content !== 'string' || !content.trim()) throw new Error('OpenRouter returned an empty response.')
    return content
  }
}
