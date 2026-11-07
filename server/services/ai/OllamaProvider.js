import { env } from '../../config/env.js'

export default class OllamaProvider {
  constructor() {
    this.name = 'ollama'
  }

  get configured() {
    return Boolean(env.OLLAMA_BASE_URL)
  }

  async healthy() {
    if (!this.configured) return false
    try {
      const response = await fetch(`${env.OLLAMA_BASE_URL.replace(/\/$/, '')}/api/tags`, { signal: AbortSignal.timeout(Math.min(env.OLLAMA_TIMEOUT_MS, 5000)) })
      if (!response.ok) return false
      const payload = await response.json()
      return Array.isArray(payload.models) && payload.models.some(model => model.name === env.OLLAMA_MODEL || model.name?.startsWith(`${env.OLLAMA_MODEL}:`))
    } catch {
      return false
    }
  }

  async generateJson({ system, user }) {
    if (!this.configured) throw new Error('Ollama is not configured.')
    const response = await fetch(`${env.OLLAMA_BASE_URL.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: env.OLLAMA_MODEL,
        stream: false,
        format: 'json',
        options: { temperature: 0.1 },
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      }),
      signal: AbortSignal.timeout(env.OLLAMA_TIMEOUT_MS),
    })
    if (!response.ok) throw Object.assign(new Error(`Ollama request failed (${response.status}).`), { status: response.status })
    const payload = await response.json()
    const content = payload.message?.content
    if (typeof content !== 'string' || !content.trim()) throw new Error('Ollama returned an empty response.')
    return content
  }
}
