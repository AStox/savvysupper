import { MilvusClient } from "@zilliz/milvus2-sdk-node";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const address = process.env.MILVUS_ENDPOINT as string;
  const token = process.env.MILVUS_TOKEN as string;
  const milvusClient = new MilvusClient({ address, token });
  const response = await milvusClient.createCollection({
    collection_name: "Ingredients",
    dimension: 1536,
  });
}
