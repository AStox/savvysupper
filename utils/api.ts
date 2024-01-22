import { defaultChatHistory } from "../components/AppStateContext";
import { Recipe } from "./generateRecipe";

async function getMeal(
  first: boolean,
  chatHistory: { role: string; content: string }[],
  setChatHistory: React.Dispatch<React.SetStateAction<{ role: string; content: string }[]>>,
  setMeals: React.Dispatch<React.SetStateAction<Recipe[]>>
): Promise<Recipe | null> {
  setChatHistory([]);
  try {
    const baseUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://savvysupper.vercel.app";

    chatHistory = chatHistory.length === 0 ? defaultChatHistory : chatHistory;
    const chatHistoryString = JSON.stringify(chatHistory);
    // const encodedChatHistory = btoa(chatHistoryString);

    const response = await fetch("/api/meal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: chatHistoryString,
    });

    if (response.status === 408) {
      console.log("timeout. Trying again");
      return null;
    }

    console.log("response", response);

    if (!response.ok) {
      return null;
    }

    if (first) {
      chatHistory.push({
        role: "user",
        content:
          "Generate a full 7 day dinner meal plan for me. Start with just the first meal. You should prioritize making a realistic recipe over using as many items as possible however. Feel free to add in items that aren't on sale if you think it will make the recipe more realistic. And tell me the pricing information for each ingredient where this information can be cited using the attached documents. If you don't know an ingredients price then just say N/A.",
      });
      setChatHistory(chatHistory);
    } else {
      chatHistory.push({
        role: "USER",
        content:
          "Now generate the next meal. Base it around a different protein than the other recipes but follow the exact same format as the other recipes. Make sure to include price information for each ingredient where possible. If you don't know the price of an ingredient then just say N/A.",
      });
      setChatHistory(chatHistory);
    }

    const data = await response.json();

    console.log("Success:", data);

    chatHistory.push({
      role: "assistant",
      content: JSON.stringify(data),
    });
    setChatHistory(chatHistory);

    data.pricing.map((price: { name: string; cost: number; savings: number }) => {
      if (!price.cost) price.cost = 0;
      if (!price.savings) price.savings = 0;
      return price;
    });

    const cost = data.pricing.reduce((acc: number, curr: { cost: number }) => acc + curr.cost, 0);
    const savings = data.pricing.reduce(
      (acc: number, curr: { savings: number }) => acc + curr.savings,
      0
    );
    const image = data.image || "/RedBeansRice.png";
    const id = data.id || 1;

    console.log("data", { ...data, cost, savings, image, id });
    return { ...data, cost, savings, image, id };
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

export { getMeal };
