import { defaultChatHistory } from "@/app/components/AppStateContext";
import { Meal } from "@/app/components/MealCard";
import { get } from "http";
import jsonic from "jsonic";

async function getMeal(
  first: boolean,
  chatHistory: { role: string; message: string }[],
  setChatHistory: React.Dispatch<React.SetStateAction<{ role: string; message: string }[]>>,
  setMeals: React.Dispatch<React.SetStateAction<Meal[]>>
): Promise<Meal | null> {
  setChatHistory([]);
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://savvysupper.vercel.app";

    const url = new URL(`${baseUrl}/api/GetMeal`);
    chatHistory = chatHistory.length === 0 ? defaultChatHistory : chatHistory;
    const chatHistoryString = JSON.stringify(chatHistory);
    const encodedChatHistory = btoa(chatHistoryString);
    console.log("FIRST", first);
    const params = { chatHistory: encodedChatHistory, first: first.toString() };
    url.search = new URLSearchParams(params).toString();

    const response = await fetch(url.toString());

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
        role: "USER",
        message:
          "Generate a full 7 day dinner meal plan for me. Start with just the first meal. Use RAG and the provided documents containing grocery sale information to generate a recipe using as many of the items as reasonably possible. You should prioritize making a realistic recipe over using as many items as possible however. Feel free to add in items that aren't on sale if you think it will make the recipe more realistic. And tell me the pricing information for each ingredient where this information can be cited using the attached documents. If you don't know an ingredients price then just say N/A.",
      });
      setChatHistory(chatHistory);
    } else {
      chatHistory.push({
        role: "USER",
        message:
          "Now generate the next meal. Base it around a different protein than the other recipes but follow the exact same format as the other recipes. Make sure to include price information for each ingredient where possible. If you don't know the price of an ingredient then just say N/A.",
      });
      setChatHistory(chatHistory);
    }

    const data = await response.json();

    console.log("Success:", data);

    chatHistory.push({
      role: "CHATBOT",
      message: JSON.stringify(data),
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
