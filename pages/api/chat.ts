import { NextApiRequest, NextApiResponse } from "next";
import { OpenAIService } from "../../utils/chat/openaiService";
import { CompletionService, CompletionServiceType } from "../../utils/chat/completionService";
import { ClaudeService } from "@/utils/chat/claudeService";
import { GeminiService } from "@/utils/chat/geminiService";

export const config = {
  maxDuration: 300,
};

const completionsService: CompletionServiceType = CompletionServiceType.ANTHROPIC;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const completionService = initCompletionService(completionsService);
    const { chatHistory, jsonFormat = true } = req.body;
    try {
      const response = await completionService.getCompletion({ chatHistory, jsonFormat });
      res.status(200).json(response.message);
    } catch (error) {
      console.error("Error with AI service:", error);
      res.status(500).json({ error: "Error processing chat request" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

function initCompletionService(serviceType: CompletionServiceType): CompletionService {
  switch (serviceType) {
    case CompletionServiceType.OPENAI:
      return new OpenAIService(process.env.OPENAI_API_KEY as string);
    case CompletionServiceType.ANTHROPIC:
      return new ClaudeService(process.env.CLAUDE_API_KEY as string);
    case CompletionServiceType.GOOGLE:
      return new GeminiService(process.env.GEMINI_API_KEY as string);
    default:
      throw new Error("Invalid completion service type");
  }
}
