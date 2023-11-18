import { queryWeaviate } from "./_Weaviate.mjs";
import { CohereClient } from "cohere-ai";
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
  const cohere = new CohereClient({
    token: apiKey,
  });

  try {
    // Query Weaviate
    const proteinDocuments = await queryWeaviate("protein", 3);
    const vegetableDocuments = await queryWeaviate("vegetable", 6);
    const carbDocuments = await queryWeaviate("carbohydrate", 2);
    const documents = proteinDocuments.concat(vegetableDocuments, carbDocuments);

    const cleanMessage = (message) => {
      return message.replace(/\+/g, " ").replace(/�/g, "°");
    };

    const chatHistoryEncoded = req.query.chatHistory;
    const chatHistoryDecoded = Buffer.from(chatHistoryEncoded, "base64").toString("utf-8");
    const chunkedChatHistory = JSON.parse(chatHistoryDecoded);
    const chatHistory = chunkedChatHistory.map((item) => ({
      ...item,
      message: cleanMessage(item.message),
    }));
    const message = "Generate the next recipe";

    console.log("CHAT HISTORY:", chatHistory);
    console.log("MESSAGE:", message);

    // const response = await cohere.chat({
    //   chatHistory: chatHistory,
    //   message: message,
    //   documents: documents,
    //   temperature: 0.9,
    // });

    const response = await cohereApiCall(chatHistory, message, documents);

    // console.log("RESPONSE FROM API:", response);

    const jsonPart = response.text
      .replace(/```json\n/, "") // Remove the starting Markdown code block
      .replace(/^.*?(\{)/, "$1") // Remove text before json
      .replace(/""/g, '"') // Replace double quotes with single quotes
      .replace(/,\s*\n\s*\]/g, "\n]") // Remove trailing commas
      .replace(/(\w)'(\w)/g, "$1’$2") // Replace single quotes with apostrophes
      .replace(/'/g, '"') // Replace single quotes with double quotes
      .replace(/\$/g, "") // Remove dollar signs
      .replace(/(\}\s*\]\s*\}\s*)([\s\S]*)$/, "$1")
      .replace(/\n```/, ""); // Remove the ending Markdown code block

    let jsonData;
    try {
      jsonData = JSON.parse(jsonPart);
    } catch (error) {
      console.log("JSON FROM API:", jsonPart);
      console.error("Error parsing JSON:", error);
      if (error instanceof Error) {
        if (error.message === "Timeout") {
          res.status(408);
        }
        res.status(500).send(`Error processing request:${error.stack}`);
      } else {
        res.status(500).send("An unknown error occurred");
      }
    }

    jsonData.pricing = jsonData.pricing.map((item) => {
      if (typeof item.cost === "string") {
        item.cost = parseFloat(item.cost.replace(/[^\d.-]/g, ""));
      }
      if (typeof item.savings === "string") {
        item.savings = parseFloat(item.savings.replace(/[^\d.-]/g, ""));
      }
      return item;
    });

    res.status(200).json(jsonData);
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .send(
          `Error processing request:${error.stack}, ${error.name}, ${error.code}, ${error.type}`
        );
    } else {
      res.status(500).send("An unknown error occurred");
    }
  }
}
