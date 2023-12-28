import { MilvusClient, SearchResultData } from "@zilliz/milvus2-sdk-node";
import OpenAI from "openai";

export default async function search(query: string): Promise<SearchResultData[]> {
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
    filter: "onSale == true",
    limit: 5,
  });
  return response.results;
}
