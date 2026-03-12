import Anthropic from '@anthropic-ai/sdk'
import type { AIConfig } from '../../src/types'

export class AIService {
  private config: AIConfig

  constructor(config: AIConfig) {
    this.config = config
  }

  private getClient(): Anthropic {
    return new Anthropic({
      apiKey: this.config.api_key,
      baseURL: this.config.provider === 'anthropic'
        ? 'https://coding.dashscope.aliyuncs.com/apps/anthropic'
        : undefined,
    })
  }

  async *generateStream(prompt: string, systemPrompt?: string): AsyncGenerator<string> {
    const client = this.getClient()

    const params: Anthropic.Messages.MessageCreateParams = {
      model: this.config.model,
      max_tokens: this.config.max_tokens,
      messages: [{ role: 'user', content: prompt }],
      temperature: this.config.temperature,
    }

    if (systemPrompt) {
      params.system = systemPrompt
    }

    const stream = await client.messages.stream(params)

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text
      }
    }
  }

  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    const client = this.getClient()

    const params: Anthropic.Messages.MessageCreateParams = {
      model: this.config.model,
      max_tokens: this.config.max_tokens,
      messages: [{ role: 'user', content: prompt }],
      temperature: this.config.temperature,
    }

    if (systemPrompt) {
      params.system = systemPrompt
    }

    const message = await client.messages.create(params)

    const textBlock = message.content.find(block => block.type === 'text')
    return textBlock ? textBlock.text : ''
  }

  async continueWriting(content: string, wordCount: number = 200): Promise<string> {
    const prompt = `请续写以下内容，续写约${wordCount}字：

${content}

要求：
1. 保持原文的风格和语调
2. 情节发展自然合理
3. 文字流畅生动`

    return await this.generate(prompt)
  }

  async polishText(content: string): Promise<string> {
    const prompt = `请润色以下文字，改进文笔和表达：

${content}

要求：
1. 保持原意不变
2. 提升文字质量和可读性
3. 修正语法错误
4. 使表达更加生动流畅`

    return await this.generate(prompt)
  }

  async generateDialogue(character1: string, character2: string, context: string): Promise<string> {
    const prompt = `请根据以下信息生成一段对话：

角色1：${character1}
角色2：${character2}
场景背景：${context}

要求：
1. 对话符合角色性格
2. 语言自然生动
3. 对话有情节推进作用`

    return await this.generate(prompt)
  }

  async generateSceneDescription(sceneName: string, atmosphere: string): Promise<string> {
    const prompt = `请描写以下场景：

场景名称：${sceneName}
氛围：${atmosphere}

要求：
1. 描写生动具体
2. 突出场景特色
3. 营造氛围感
4. 约150-200字`

    return await this.generate(prompt)
  }
}