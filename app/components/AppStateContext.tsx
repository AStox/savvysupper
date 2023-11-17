import React, { createContext, useContext, useState, ReactNode } from "react";
import { Meal } from "./MealCard";

const AppStateContext = createContext<{
  meals: Meal[];
  setMeals: React.Dispatch<React.SetStateAction<Meal[]>>;
  chatHistory: { role: string; message: string }[];
  setChatHistory: React.Dispatch<React.SetStateAction<{ role: string; message: string }[]>>;
  numberOfMeals: number;
  setNumberOfMeals: React.Dispatch<React.SetStateAction<number>>;
}>({
  meals: [],
  setMeals: () => {},
  chatHistory: [],
  setChatHistory: () => {},
  numberOfMeals: 1,
  setNumberOfMeals: () => {},
});

export const useAppState = () => useContext(AppStateContext);

interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const [meals, setMeals] = useState([] as Meal[]);
  const [numberOfMeals, setNumberOfMeals] = useState(1);
  const [chatHistory, setChatHistory] = useState([
    {
      role: "USER",
      message: `Use RAG and the provided documents containing grocery sale information to generate a recipe using as many of the items as reasonably possible.
      You should prioritize making a realistic recipe over using as many items as possible however. 
      Feel free to add in items that aren't on sale if you think it will make the recipe more realistic. 
      And tell me the pricing information for each ingredient where this information can be cited using the attached documents. 
      If you don't know an ingredients price then just say N/A. Here's an example recipe. 
      Always respond in valid JSON, following an identical structure to the following example:

      {
        "title": "Sweet Potato and Chicken Hash",

        "ingredients": [
            "2 sweet potatoes",
            "4 chicken breasts",
            "1 red onion",
            "1 zucchini",
            "1 head of broccoli",
            "1/2 cup of cooked brown rice",
            "1/4 cup of olive oil",
            "1/2 teaspoon of salt",
            "1/4 teaspoon of black pepper",
        ],

        "Instructions": [
            "Preheat oven to 425°F.",
            "Chop all vegetables.",
            "In a large bowl, toss sweet potatoes, zucchini, onion, and broccoli with olive oil, salt, and pepper.",
            "Spread the vegetables on a baking sheet and roast in the oven for 25 minutes.",
            "Cook the brown rice as per the instructions on the package.",
            "Meanwhile, heat a large non-stick skillet over medium-high heat and cook the chicken breasts for 6-8 minutes on each side or until cooked through.",
            "Once the vegetables are roasted, add the rice and chicken to the bowl and toss to combine.",
            "Serve immediately and enjoy!",
        ],

        "Pricing Information": [
            "Sweet Potato (price: $1.12, Savings: $3.27)",
            "Chicken Breast (price: $4.61, Savings: $18.52)",
            "Red Onion (price: $1.32, Savings: $4.61)",
            "Zucchini (price: $1.08, Savings: $4.85)",
            "Broccoli (price: N/A)",
            "Brown Rice (price: N/A)",
            "Olive Oil (price: N/A)",
            "Salt (price: N/A)",
            "Black Pepper (price: N/A)",
        ]

        "Total Savings": "$31.25"
     }
`,
    },
  ]);

  return (
    <AppStateContext.Provider
      value={{ meals, setMeals, chatHistory, setChatHistory, numberOfMeals, setNumberOfMeals }}
    >
      {children}
    </AppStateContext.Provider>
  );
};
