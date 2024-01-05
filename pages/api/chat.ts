import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    const apiKey = process.env.OPENAI_API_KEY as string;
    if (!apiKey) {
      res.status(500).json({ error: "Server configuration error: Missing API key" });
      return;
    }

    const openAI = new OpenAI({ apiKey });
    const { chatHistory, jsonFormat = true } = req.body;

    try {
      const requestOptions: any = {
        model: "gpt-4-1106-preview",
        messages: chatHistory,
        stream: true,
      };

      if (jsonFormat) {
        requestOptions.response_format = { type: "json_object" };
      }

      const response = await openAI.chat.completions.create(requestOptions);
      res.status(200).json(response.choices[0].message);
    } catch (error) {
      console.error("Error with OpenAI chat:", error);
      res.status(500).json({ error: "Error processing chat request" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
