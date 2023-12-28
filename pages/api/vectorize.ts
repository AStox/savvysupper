import OpenAI from "openai";
import { Ingredient } from "./ingredientScraper";
import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { v4 as uuidv4 } from "uuid";

let lastId: number | null = null;

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const data = JSON.parse(
    fs.readFileSync("data/ingredients/Fresh_Fruits_&_Vegetables_ingredients.json", "utf8")
  );

  const response = await vectorizeData(data);

  if (response.data.length !== data.length) {
    res.status(500).json(response);
    return;
  }

  const vectorizedData = data.map((ingredient: Ingredient, index: number) => {
    return {
      ...ingredient,
      vector: response.data[index].embedding,
      id: generateUniqueId(),
    };
  });

  const originalFileName = path.basename(
    "data/ingredients/Fresh_Fruits_&_Vegetables_ingredients.json"
  );
  const outputFilePath = `data/vectors/${originalFileName}`;

  if (!fs.existsSync("data/vectors")) {
    fs.mkdirSync("data/vectors");
  }
  fs.writeFileSync(outputFilePath, JSON.stringify(vectorizedData));

  res.status(200).json({ message: "All vectors stored in Milvus" });
}

async function vectorizeData(data: any) {
  const apiKey: string | undefined = process.env.OPENAI_API_KEY;
  const openAI = new OpenAI({ apiKey: apiKey });
  const response = await openAI.embeddings.create({
    model: "text-embedding-ada-002",
    input: data.map(ingredientToPlaneText),
  });

  console.log(response);

  return response;
}

function ingredientToPlaneText(ingredient: Ingredient) {
  return `${ingredient.quantity} of ${ingredient.title} for ${ingredient.currentPrice}${
    ingredient.onSale ? " on sale. Regularly " + ingredient.regularPrice : ""
  }`;
}

function generateUniqueId(): string {
  let newId: number;
  do {
    newId = Date.now();
  } while (newId === lastId);

  lastId = newId;
  return newId.toString();
}
