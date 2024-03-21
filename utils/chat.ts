export async function fetchChatResponse(chatHistory: any, jsonFormat = true) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ chatHistory, jsonFormat }),
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  // console.log("Chat Response:", data);
  return data;
}
