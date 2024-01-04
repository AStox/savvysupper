import { NextApiRequest, NextApiResponse } from "next";
import { MilvusClient, SearchResultData } from "@zilliz/milvus2-sdk-node";
import OpenAI from "openai";

async function searchMilvus(query: string, limit: number): Promise<SearchResultData[]> {
  const address = process.env.MILVUS_ENDPOINT as string;
  const token = process.env.MILVUS_TOKEN as string;
  const milvusClient = new MilvusClient({ address, token });

  const apiKey: string | undefined = process.env.OPENAI_API_KEY;
  const openAI = new OpenAI({ apiKey: apiKey });
  const vectorResponse = await openAI.embeddings.create({
    model: "text-embedding-ada-002",
    input: query,
  });

  const response = await milvusClient.search({
    collection_name: "Ingredients",
    vector: vectorResponse.data[0].embedding,
    output_fields: ["title", "quantity", "currentPrice", "regularPrice", "onSale"],
    limit,
  });
  return response.results;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query, limit } = req.query;

  try {
    const results = await searchMilvus(query as string, parseInt(limit as string));
    console.log("SEARCH RESULTS:", results);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: (error as any).message });
  }
}
