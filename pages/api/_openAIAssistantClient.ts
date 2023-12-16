import OpenAI from "openai";

export class OpenAiAssistantClient {
  private openAI: OpenAI;

  constructor(apiKey: string) {
    this.openAI = new OpenAI({ apiKey: apiKey });
  }

  async chat(chatHistory: any[], documents: any[]): Promise<any> {
    try {
      const assistant = await this.openAI.beta.assistants.create({
        name: "Recipe generator",
        instructions:
          "You are a helpful algorithm designed to take in grocery store sale data and output diverse and delicioius recipes using as many of the sale items as possible.",
        tools: [{ type: "retrieval" }],
        model: "gpt-4-1106-preview",
      });
    } catch (error) {
      console.error("Error with OpenAI Assistant:", error);
      throw error;
    }
  }
}
