import { NextApiRequest, NextApiResponse } from "next";
import { OpenAIService } from "../../utils/chat/openaiService";
import { CompletionService } from "../../utils/chat/completionService";
import { GeminiService } from "@/utils/chat/geminiService";

export const config = {
  maxDuration: 300,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const apiKey = process.env.GEMINI_API_KEY as string;
    if (!apiKey) {
      res.status(500).json({ error: "Server configuration error: Missing API key" });
      return;
    }

    // const aiService: CompletionService = new OpenAIService(apiKey);
    const aiService: CompletionService = new GeminiService(apiKey);
    const { chatHistory, jsonFormat = true } = req.body;

    try {
      const response = await aiService.getCompletion({ chatHistory, jsonFormat });
      res.status(200).json(response.message);
    } catch (error) {
      console.error("Error with AI service:", error);
      res.status(500).json({ error: "Error processing chat request" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
