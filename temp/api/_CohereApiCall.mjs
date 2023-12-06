import fetch from "node-fetch";

export async function cohereApiCall(chat_history, message, documents) {
  const url = "https://api.cohere.ai/v1/chat";
  const cohereApiKey = process.env.NEXT_PUBLIC_COHERE_API_KEY || "";

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${cohereApiKey}`,
  };

  const body = {
    chat_history,
    message,
    documents,
    temperature: 0.9,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("RESPONSE FROM COHERE CALL:", data);
    return data;
  } catch (error) {
    console.error("Error making API call:", error);
  }
}
