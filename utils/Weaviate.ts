import weaviate, { ApiKey, WeaviateClient } from "weaviate-ts-client";

export async function queryWeaviate(queryString: string, resultLimit: number = 20): Promise<any[]> {
  const cohereApiKey = process.env.COHERE_API_KEY || "";

  const weaviateApiKey = process.env.WEAVIATE_API_KEY || "";
  const client: WeaviateClient = weaviate.client({
    scheme: "https",
    host: "https://adcorp-vghi1hv6.weaviate.network",
    apiKey: new ApiKey(weaviateApiKey),
    headers: { "X-Cohere-Api-Key": cohereApiKey },
  });

  try {
    const queryResult = await client.graphql
      .get()
      .withClassName("Sales")
      .withFields("title discountedPrice amountSaved")
      .withNearText({ concepts: [queryString] })
      .withLimit(resultLimit)
      .do();

    // Process the query result
    const processedDocuments: any[] = [];
    queryResult.data.Get.Sales.forEach((item: any) => {
      processedDocuments.push({
        title: item.title || "",
        snippet: `${item.title} (price: $${
          item.discountedPrice
        }, Savings: $${item.amountSaved.toFixed(2)})`,
      });
    });

    return processedDocuments;
  } catch (error) {
    console.error("Error querying Weaviate:", error);
    throw error; // Rethrow the error for handling by the caller
  }
}
