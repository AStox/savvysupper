import OpenAI from "openai";

export class OpenAIChatClient {
  private openAI: OpenAI;

  constructor(apiKey: string) {
    this.openAI = new OpenAI({ apiKey: apiKey });
  }

  async chat(chatHistory: any[]): Promise<any> {
    try {
      const response = await this.openAI.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: chatHistory,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error("Error with OpenAI chat:", error);
      throw error;
    }
  }
}
