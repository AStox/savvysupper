import OpenAI from "openai";

export class OpenAIChatClient {
  private openAI: OpenAI;

  constructor(apiKey: string) {
    this.openAI = new OpenAI({ apiKey: apiKey });
  }

  async chat(chatHistory: any[], jsonFormat = true): Promise<any> {
    try {
      const requestOptions = {
        model: "gpt-4-1106-preview",
        messages: chatHistory,
      };

      if (jsonFormat) {
        requestOptions.response_format = { type: "json_object" };
      }

      const response = await this.openAI.chat.completions.create(requestOptions);
      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error with OpenAI chat:", error);
      throw error;
    }
  }
}
