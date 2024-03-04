import { NextApiRequest, NextApiResponse } from "next";
import { Ingredient } from "@prisma/client";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

async function getSaleProteins(): Promise<(Ingredient & { similarity: number })[]> {
  const apiKey: string | undefined = process.env.OPENAI_API_KEY;
  const openAI = new OpenAI({ apiKey: apiKey });
  const proteins = [
    "Steak",
    "Veal",
    "Chicken",
    "Pork",
    "Turkey",
    "Lamb",
    "Fish",
    "Seafood",
    "Bacon",
    "Sausages",
    "Tofu",
    "Tempeh",
    "Lentils",
    "Chickpeas",
    "Beans",
    "Quinoa",
    "Eggs",
  ];
  const proteinVectors = [];
  for (const protein of proteins) {
    const vectorResponse = await openAI.embeddings.create({
      model: "text-embedding-3-large",
      input: protein,
    });
    const embedding = vectorResponse.data[0].embedding;
    const vectorQuery = `[${embedding.join(",")}]`;
    proteinVectors.push(vectorQuery);
  }

  let ingredients: (Ingredient & { similarity: number })[] = await prisma.$queryRaw`
    WITH ranked_ingredients AS (
      SELECT *, 1 - (embedding <=> array[${proteinVectors.join("],[")}]::float[]) as similarity
      FROM ingredients
      WHERE "onSale" = true
      ORDER BY "discount" DESC, similarity DESC
      LIMIT 100
    )
    SELECT * FROM ranked_ingredients
    WHERE similarity > .5
    ORDER BY similarity DESC
    LIMIT 100;
  `;
  return ingredients;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const results = await getSaleProteins();
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: (error as any).message });
  }
}
