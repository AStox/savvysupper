import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

export const config = {
  maxDuration: 300,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.OPENAI_API_KEY as string;
  const openAI = new OpenAI({ apiKey });
  let { prompt } = req.query;
  prompt = prompt;
  try {
    const response = await openAI.images.generate({
      model: "dall-e-3",
      prompt: prompt as string,
      n: 1,
      size: "1024x1024",
    });
    const data = response.data[0];
    console.log("DATA:", data);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error with OpenAI image:", error);
    res.status(500).json({ error });
  }
}
