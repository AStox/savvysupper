import {
  CompletionService,
  CompletionResponse,
  CompletionRequestOptions,
} from "./completionService";
import OpenAI from "openai";

export class OpenAIService implements CompletionService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getCompletion(options: CompletionRequestOptions): Promise<CompletionResponse> {
    const openAI = new OpenAI({ apiKey: this.apiKey });
    const requestOptions: any = {
      model: "gpt-4-turbo-preview",
      messages: options.chatHistory,
    };

    if (options.jsonFormat) {
      requestOptions.response_format = { type: "json_object" };
    }

    const response = await openAI.chat.completions.create(requestOptions);
    return { message: response.choices[0].message.content || "" };
  }
}
