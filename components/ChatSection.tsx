// chatSection.tsx
import { fetchChatResponse } from "@/utils/chat";
import { executeRawSQLQuery } from "@/utils/executeRawSql";
import { Cuisines, DietaryRestrictions } from "@/utils/generateRecipe";
import { useState } from "react";

type Message = {
  content: string;
  role: "assistant" | "user" | "system";
};

const initialMessages: Message[] = [
  {
    role: "assistant",
    content:
      "Hi, I can make you a meal plan that takes advantage of local sales. Just tell me what you feel like.",
  },
];

export default function ChatSection() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const handleSend = async () => {
    if (inputText.trim() === "") return;

    const newMessage: Message = {
      content: inputText,
      role: "user",
    };

    setMessages([...messages, newMessage]);
    setInputText(""); // Clear input after sending

    const systemMessage: Message = {
      content: `You are an ai assistant taking in plane text from users about what kind of meal plan they would like and outputting a json object that contains a prisma query to get meals that match their criteria.
      Below is the recipe table schema that you will be querying:
      \`\`\`
      model Ingredient {
        id          String             @default(cuid()) @id
        title       String
        amount      Float
        units       String
        category    String
        currentPrice Float
        regularPrice Float
        perUnitPrice Float
        discount    Float
        onSale      Boolean
        dateAdded   DateTime           @default(now())
        RecipeIngredient RecipeIngredient[]
    
        embedding   Unsupported("vector(3072)")?
    
        @@map("ingredients")
    }
    
    model Recipe {
        id            String             @default(cuid()) @id
        title         String
        image         String?
        cuisine       String
        description   String
        serves        Int
        prepTime      Int
        cookTime      Int
        ingredients   Json
        unpricedIngredients Json
        shoppingList  RecipeIngredient[]
        instructions  Json
        totalCost     Float
        regularPrice  Float
        dietaryRestrictions Json
    }
    
    model RecipeIngredient {
        ingredientId String
        recipeId     String
        amountToBuy  Int
        amountLeftover Int
        units       String
        recipeIngredientTitle String
    
        ingredient   Ingredient @relation(fields: [ingredientId], references: [id])
        recipe       Recipe     @relation(fields: [recipeId], references: [id])
    
        @@id([ingredientId, recipeId])
    }
\`\`\`
available cuisines are: ${Object.values(Cuisines).join(", ")}
available Dietary Restrictions are: ${Object.values(DietaryRestrictions).join(", ")}

Your returned JSON should be in the following format:
{
  rawSql: \`SELECT * FROM recipes WHERE "dietaryRestrictions" @> '["Vegan"]' LIMIT 5\`,
}

return 5 meals if not otherwise specified.
`,
      role: "system",
    };

    const chatHistory = [systemMessage, ...messages, newMessage];
    const response = JSON.parse(await fetchChatResponse(chatHistory));
    const result = await executeRawSQLQuery(response.rawSql);
    setMessages([...messages, newMessage, { role: "assistant", content: JSON.stringify(result) }]);
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
