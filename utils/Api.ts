import { Meal } from "@/app/components/MealCard";

async function getMeal(
  first: boolean,
  chatHistory: { role: string; message: string }[],
  setChatHistory: React.Dispatch<React.SetStateAction<{ role: string; message: string }[]>>
): Promise<Meal | null> {
  try {
    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000" // Use your local server URL
        : "https://savvysupper.vercel.app";

    const url = new URL(`${baseUrl}/api/GetMeal`);
    console.log("chatHistory", chatHistory);
    const params = { chatHistory: JSON.stringify(chatHistory) };
    url.search = new URLSearchParams(params).toString();
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    if (first) {
      chatHistory.push({
        role: "user",
        message:
          "Generate a full 7 day dinner meal plan for me. Start with just the first meal. Use RAG and the provided documents containing grocery sale information to generate a recipe using as many of the items as reasonably possible. You should prioritize making a realistic recipe over using as many items as possible however. Feel free to add in items that aren't on sale if you think it will make the recipe more realistic. And tell me the pricing information for each ingredient where this information can be cited using the attached documents. If you don't know an ingredients price then just say N/A.",
      });
      setChatHistory(chatHistory);
    } else {
      chatHistory.push({
        role: "user",
        message:
          "Now generate the next meal. Base it around a different protein than the other recipes but follow the exact same format as the other recipes. Make sure to include price information for each ingredient where possible. If you don't know the price of an ingredient then just say N/A.",
      });
      setChatHistory(chatHistory);
    }

    const data = await response.json();

    chatHistory.push({
      role: "bot",
      message: data.text,
    });
    setChatHistory(chatHistory);

    return data;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

export { getMeal };
