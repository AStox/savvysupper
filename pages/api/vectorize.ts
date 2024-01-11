import OpenAI from "openai";
import { Ingredient } from "./ingredientScraper";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

let lastId: number | null = null;

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const ingredients = await prisma.ingredient.findMany();
  const response = await vectorizeData(ingredients);

  if (response.data.length !== ingredients.length) {
    res.status(500).json(response);
    return;
  }

  for (let i = 0; i < ingredients.length; i++) {
    await prisma.$executeRaw`
        UPDATE ingredients
        SET embedding = ${response.data[i].embedding}::vector
        WHERE id = ${ingredients[i].id}
    `;
    console.log(`Updated ingredient ${i} of ${ingredients.length}: ${ingredients[i].title}`);
  }

  res.status(200).json({ message: "All ingredients vectorized" });
}

async function vectorizeData(data: any) {
  const apiKey: string | undefined = process.env.OPENAI_API_KEY;
  const openAI = new OpenAI({ apiKey: apiKey });
  const response = await openAI.embeddings.create({
    model: "text-embedding-ada-002",
    input: data.map((item: Ingredient) => item.title),
  });

  console.log(response);

  return response;
}
