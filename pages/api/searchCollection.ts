import { NextApiRequest, NextApiResponse } from "next";
import { Ingredient, PrismaClient } from "@prisma/client";
import OpenAI from "openai";

async function similaritySearch(
  query: string,
  limit: number
): Promise<(Ingredient & { similarity: number })[]> {
  console.log("QUERY:", query);
  const prisma = new PrismaClient();

  const apiKey: string | undefined = process.env.OPENAI_API_KEY;
  const openAI = new OpenAI({ apiKey: apiKey });
  const vectorResponse = await openAI.embeddings.create({
    model: "text-embedding-ada-002",
    input: query,
  });

  const embedding = vectorResponse.data[0].embedding;
  const vectorQuery = `[${embedding.join(",")}]`;
  const ingredients: (Ingredient & { similarity: number })[] = await prisma.$queryRaw`
      SELECT
        "title",
        "quantity",
        "currentPrice",
        "regularPrice",
        "onSale",
        1 - (embedding <=> ${vectorQuery}::vector) as similarity
      FROM ingredients
      where 1 - (embedding <=> ${vectorQuery}::vector) > .5
      ORDER BY  similarity DESC
      LIMIT 8;
    `;
  return ingredients;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query, limit } = req.query;

  try {
    const results = await similaritySearch(query as string, parseInt(limit as string));
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: (error as any).message });
  }
}
