// openAIService.ts
import {
  CompletionService,
  CompletionResponse,
  CompletionRequestOptions,
} from "./completionService";
import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiService implements CompletionService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getCompletion(options: CompletionRequestOptions): Promise<CompletionResponse> {
    const genAI = new GoogleGenerativeAI(this.apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    let prompt = options.chatHistory.map((chat) => chat.role + ": " + chat.content).join("\n");
    prompt +=
      "Your response is being parsed into JSON so only respond in valid JSON. Don't inlcude anything like ```JSON at the top. Just return the JSON object. Make absolutely sure what you're returning is valid JSON. Numbers must be floats";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return { message: text };
  }
}
