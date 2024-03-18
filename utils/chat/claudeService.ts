import Anthropic from "@anthropic-ai/sdk";

import {
  CompletionService,
  CompletionResponse,
  CompletionRequestOptions,
} from "./completionService";

export class ClaudeService implements CompletionService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getCompletion(options: CompletionRequestOptions): Promise<CompletionResponse> {
    const anthropic = new Anthropic({ apiKey: this.apiKey });

    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      system:
        "Only return valid JSON responses. No other text of any kind. Your responses are fed directly into a JSON parser.",
      messages: options.chatHistory,
    });
    return { message: response.content[0].text || "" };
  }
}
