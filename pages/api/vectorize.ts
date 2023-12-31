import OpenAI from "openai";
import { Ingredient } from "./ingredientScraper";
import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { v4 as uuidv4 } from "uuid";

let lastId: number | null = null;

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const ingredientsFolderPath = "data/ingredients";
  const vectorsFolderPath = "data/vectors";

  const ingredientFiles = fs.readdirSync(ingredientsFolderPath);

  for (const ingredientFile of ingredientFiles) {
    const ingredientFilePath = path.join(ingredientsFolderPath, ingredientFile);
    const data = JSON.parse(fs.readFileSync(ingredientFilePath, "utf8"));

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

    const originalFileName = path.basename(ingredientFilePath);
    const outputFilePath = path.join(vectorsFolderPath, originalFileName);

    if (!fs.existsSync(vectorsFolderPath)) {
      fs.mkdirSync(vectorsFolderPath);
    }
    fs.writeFileSync(outputFilePath, JSON.stringify(vectorizedData));
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

function generateUniqueId(): string {
  let newId: number;
  do {
    newId = Date.now();
  } while (newId === lastId);

  lastId = newId;
  return newId.toString();
}
