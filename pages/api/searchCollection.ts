import { NextApiRequest, NextApiResponse } from "next";
import { Ingredient } from "@prisma/client";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

async function similaritySearch(
  query: string,
  limit: number,
  onSale: boolean
): Promise<(Ingredient & { similarity: number })[]> {
  const apiKey: string | undefined = process.env.OPENAI_API_KEY;
  const openAI = new OpenAI({ apiKey: apiKey });
  const vectorResponse = await openAI.embeddings.create({
    model: "text-embedding-3-large",
    input: query.toLocaleLowerCase(),
  });

  const embedding = vectorResponse.data[0].embedding;
  const vectorQuery = `[${embedding.join(",")}]`;
  let ingredients: (Ingredient & { similarity: number })[];
  if (onSale) {
    ingredients = await prisma.$queryRaw`
      SELECT
        "id",
        "title",
        "amount",
        "units",
        "currentPrice",
        "regularPrice",
        "perUnitPrice",
        "discount",
        "onSale",
        1 - (embedding <=> ${vectorQuery}::vector) as similarity
      FROM ingredients
      WHERE 1 - (embedding <=> ${vectorQuery}::vector) > .6
      AND "onSale" = true
      ORDER BY "discount" DESC, similarity DESC
      LIMIT ${limit};
    `;
  } else {
    ingredients = await prisma.$queryRaw`
      SELECT
        "id",
        "title",
        "amount",
        "units",
        "currentPrice",
        "regularPrice",
        "perUnitPrice",
        "discount",
        "onSale",
        1 - (embedding <=> ${vectorQuery}::vector) as similarity
      FROM ingredients
      WHERE 1 - (embedding <=> ${vectorQuery}::vector) > .6
      ORDER BY "discount" DESC, similarity DESC
      LIMIT ${limit};
    `;
  }
  return ingredients;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query, limit, onSale } = req.query;

  try {
    const results = await similaritySearch(
      query as string,
      parseInt(limit as string),
      onSale === "true"
    );
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: (error as any).message });
  }
}
