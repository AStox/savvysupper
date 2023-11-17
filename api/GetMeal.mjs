import { queryWeaviate } from "./_Weaviate.mjs";
import { cohereApiCall } from "./_CohereApiCall.mjs";

export default async function getMeal(req, res) {
  // Load API Key
  const apiKey = process.env.COHERE_API_KEY;

  // Check if API Key is available
  if (!apiKey) {
    res.status(500).send("API key is missing");
    return;
  }

  // Initialize Cohere Client
  // const cohere = new CohereClient({
  //   token: apiKey,
  // });

  try {
    // Query Weaviate
    const proteinDocuments = await queryWeaviate("protein", 3);
    const vegetableDocuments = await queryWeaviate("vegetable", 6);
    const carbDocuments = await queryWeaviate("carbohydrate", 2);
    const documents = proteinDocuments.concat(vegetableDocuments, carbDocuments);

    const chatHistory = req.body.chatHistory;
    const message = req.body.first ? "Generate the first recipe" : "Generate the next recipe";

    const response = await cohereApiCall(chatHistory, message, documents);

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send(`Error processing request: ${error.message}`);
    } else {
      res.status(500).send("An unknown error occurred");
    }
  }
}
