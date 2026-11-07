import OpenRouterProvider from './OpenRouterProvider.js'
import OllamaProvider from './OllamaProvider.js'

export class AIUnavailableError extends Error {
  constructor() {
    super('Resume analysis is temporarily unavailable. Your resume was not analyzed; retry when an AI provider is available.')
    this.status = 503
    this.code = 'AI_UNAVAILABLE'
  }
}

export default class AIProviderManager {
  constructor({ openRouter = new OpenRouterProvider(), ollama = new OllamaProvider() } = {}) {
    this.openRouter = openRouter
    this.ollama = ollama
  }

  async generateJson(prompt) {
    if (this.openRouter.configured) {
      try {
        return { provider: this.openRouter.name, content: await this.openRouter.generateJson(prompt) }
      } catch (error) {
        console.warn(`[ai] OpenRouter request failed (status ${error.status || 'unknown'}); checking configured Ollama fallback.`)
      }
    }
    if (this.ollama.configured && await this.ollama.healthy()) {
      try {
        return { provider: this.ollama.name, content: await this.ollama.generateJson(prompt) }
      } catch {
        console.warn('[ai] Ollama fallback request failed.')
      }
    }
    throw new AIUnavailableError()
  }
}

export const aiProviderManager = new AIProviderManager()
