import { Recipe } from "@/utils/meal";
import prisma from "@/lib/prisma";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

const AppStateContext = createContext<{
  meals: Recipe[];
  setMeals: React.Dispatch<React.SetStateAction<Recipe[]>>;
  chatHistory: { role: string; content: string }[];
  setChatHistory: React.Dispatch<React.SetStateAction<{ role: string; content: string }[]>>;
  numberOfMeals: number;
  setNumberOfMeals: React.Dispatch<React.SetStateAction<number>>;
  generating: boolean;
  setGenerating: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  meals: [],
  setMeals: () => {},
  chatHistory: [],
  setChatHistory: () => {},
  numberOfMeals: 1,
  setNumberOfMeals: () => {},
  generating: false,
  setGenerating: () => {},
});

export const useAppState = () => useContext(AppStateContext);

interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const [meals, setMeals] = useState([] as Recipe[]);
  const [numberOfMeals, setNumberOfMeals] = useState(1);
  const [chatHistory, setChatHistory] = useState(defaultChatHistory);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchMeals = async () => {
      const recipes = await fetch("/api/getRecipes").then((res) => res.json());
      console.log("recipes", recipes);
      setMeals(recipes);
    };

    fetchMeals();
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        meals,
        setMeals,
        chatHistory,
        setChatHistory,
        numberOfMeals,
        setNumberOfMeals,
        generating,
        setGenerating,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const defaultChatHistory = [
  {
    role: "system",
    content: `You are a helpful algorithm designed to take in grocery store sale data and output diverse and delicioius recipes using as many of the sale items as possible.
    Be sure to cite pricing data for all ingredients pulled from the list of sale data. Any ingredients not on sale should be listed with a cost of 0.
    Always respond in valid JSON, following an identical structure to the following examples. cost and savings fields should be numbers not strings.

    EXMAPLE SALE DATA:
    [
      { name: "Sweet Potato", cost: 1.12, savings: 3.27 },
      { name: "Chicken Breast", cost: 4.61, savings: 18.52 },
      { name: "Red Onion", cost: 1.32, savings: 4.61 },
      { name: "Zucchini", cost: 1.08, savings: 4.85 },
    ]

    EXAMPLE RECIPES USING SALE DATA:
    {
      title: "Sweet Potato and Chicken Hash",
      ingredients: [
        "2 sweet potatoes",
        "4 chicken breasts",
        "1 red onion",
        "1 zucchini",
        "1 head of broccoli",
        "1/2 cup of cooked brown rice",
        "1/4 cup of olive oil",
        "1/2 teaspoon of salt",
        "1/4 teaspoon of black pepper"
      ],
      instructions: [
        "Preheat oven to 425°F.",
        "Chop all vegetables.",
        "In a large bowl, toss sweet potatoes, zucchini, onion, and broccoli with olive oil, salt, and pepper.",
        "Spread the vegetables on a baking sheet and roast in the oven for 25 minutes.",
        "Cook the brown rice as per the instructions on the package.",
        "Meanwhile, heat a large non-stick skillet over medium-high heat and cook the chicken breasts for 6-8 minutes on each side or until cooked through.",
        "Once the vegetables are roasted, add the rice and chicken to the bowl and toss to combine.",
        "Serve immediately and enjoy!"
      ],
      pricing: [
        { name: "Sweet Potato", cost: 1.12, savings: 3.27 },
        { name: "Chicken Breast", cost: 4.61, savings: 18.52 },
        { name: "Red Onion", cost: 1.32, savings: 4.61 },
        { name: "Zucchini", cost: 1.08, savings: 4.85 },
        { name: "Broccoli", cost: 0, savings: 0 },
        { name: "Brown Rice", cost: 0, savings: 0 },
        { name: "Olive Oil", cost: 0, savings: 0 },
        { name: "Salt", cost: 0, savings: 0 },
        { name: "Black Pepper", cost: 0, savings: 0 }
      ],
   }
`,
  },
];
