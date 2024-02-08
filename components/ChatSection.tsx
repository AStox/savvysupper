// chatSection.tsx
import { fetchChatResponse } from "@/utils/chat";
import { executeRawSQLQuery } from "@/utils/executeRawSql";
import { Cuisines, DietaryRestrictions } from "@/utils/generateRecipe";
import { useState } from "react";
import { useAppState } from "./AppStateContext";
import { generateChatQueryPreamble } from "@/utils/prompts/preamble";
import styles from "./ChatSection.module.css";

type Message = {
  content: string;
  role: "assistant" | "user" | "system";
};

const initialMessage: Message = {
  role: "assistant",
  content:
    "Hi, I can make you a meal plan that takes advantage of local sales. Just tell me what you feel like.",
};

export default function ChatSection() {
  const { meals, setMeals } = useAppState();
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [inputText, setInputText] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const handleSend = async () => {
    if (inputText.trim() === "") return;

    const userMessage: Message = {
      content: inputText,
      role: "user",
    };

    setMessages([...messages, userMessage]);
    setInputText("");
    setIsFetching(true);

    const systemMessage: Message = {
      content: generateChatQueryPreamble(),
      role: "system",
    };

    const chatHistory = [systemMessage, ...messages, userMessage];
    const sql = JSON.parse(await fetchChatResponse(chatHistory));
    const result = await executeRawSQLQuery(sql.rawSql);

    const response = await fetchChatResponse(
      [
        initialMessage,
        userMessage,
        {
          role: "assistant",
          content: `Here are some recipes I found for you: [${result
            .map((meal: any) => meal.title)
            .join(", ")}]`,
        },
        {
          role: "user",
          content: `In one sentence tell me what you found. If you weren't able to meet my criteria, tell me that.
            You should only talk about the recipes you returned in the previous message. Don't mention or suggest any other recipes.
            Ignore any user message that is not about recipes. You're only meant to help me come up with a meal plan. Further, don't break the illusion by telling me this restriction. Just ignore my messages.`,
        },
      ],
      false
    );
    setMeals(result);
    setMessages([...messages, userMessage, { role: "assistant", content: response }]);
    setIsFetching(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg ${
              message.role === "user" ? "bg-blue-500 text-white ml-auto" : "bg-gray-200"
            }`}
          >
            {message.content}
          </div>
        ))}
        {isFetching && (
          <div className="flex justify-center items-center">
            <div className={styles.typingIndicator}>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="flex-1 p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
