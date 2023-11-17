"use client";
import React, { useState } from "react";
import TopBar from "../app/components/TopBar";
import MealPlan from "../app/components/MealPlan";
import { Meal } from "../app/components/MealCard"; // Import the Meal interface
import SecondaryTopBar from "./components/SecondaryTopBar";
import { AppStateProvider } from "./components/AppStateContext";

// Define your mock data with types
const mockMeals: Meal[] = [
  // Populate with mock meal data according to the Meal interface
  {
    id: 1,
    image: "/RedBeansRice.png",
    title: "Meal Title",
    ingredients: ["Ingredient 1", "Ingredient 2"],
    cost: 10.99,
    savings: 2.99,
  },
];

const Home = () => {
  const [meals, setMeals] = useState([] as Meal[]);
  const [chatHistory, setChatHistory] = useState([
    {
      role: "USER",
      message: `Use RAG and the provided documents containing grocery sale information to generate a recipe using as many of the items as reasonably possible.
      You should prioritize making a realistic recipe over using as many items as possible however. 
      Feel free to add in items that aren't on sale if you think it will make the recipe more realistic. 
      And tell me the pricing information for each ingredient where this information can be cited using the attached documents. 
      If you don't know an ingredients price then just say N/A. Here's an example recipe. 
      Always follow an identical format when responding and only respond with a recipe. No extra words.

      ## Sweet Potato and Chicken Hash

      **Ingredients:**
      - 2 sweet potatoes
      - 4 chicken breasts
      - 1 red onion
      - 1 zucchini
      - 1 head of broccoli
      - 1/2 cup of cooked brown rice
      - 1/4 cup of olive oil
      - 1/2 teaspoon of salt
      - 1/4 teaspoon of black pepper

      **Instructions:**
      1. Preheat oven to 425°F.
      2. Chop all vegetables.
      3. In a large bowl, toss sweet potatoes, zucchini, onion, and broccoli with olive oil, salt, and pepper.
      4. Spread the vegetables on a baking sheet and roast in the oven for 25 minutes.
      5. Cook the brown rice as per the instructions on the package.
      6. Meanwhile, heat a large non-stick skillet over medium-high heat and cook the chicken breasts for 6-8 minutes on each side or until cooked through.
      7. Once the vegetables are roasted, add the rice and chicken to the bowl and toss to combine.
      8. Serve immediately and enjoy!

      **Pricing Information:**
      - Sweet Potato (price: $1.12, Savings: $3.27)
      - Chicken Breast (price: $4.61, Savings: $18.52)
      - Red Onion (price: $1.32, Savings: $4.61)
      - Zucchini (price: $1.08, Savings: $4.85)
      - Broccoli (price: N/A)
      - Brown Rice (price: N/A)
      - Olive Oil (price: N/A)
      - Salt (price: N/A)
      - Black Pepper (price: N/A)

      Total Savings: $31.25
`,
    },
  ]);
  const totalCost = mockMeals.reduce((acc, meal) => acc + meal.cost, 0); // Example calculation
  const totalSavings = mockMeals.reduce((acc, meal) => acc + meal.savings, 0); // Example calculation

  return (
    <AppStateProvider>
      <div>
        <TopBar />
        <SecondaryTopBar />
        <MealPlan meals={mockMeals} totalCost={totalCost} totalSavings={totalSavings} />
      </div>
    </AppStateProvider>
  );
};

export default Home;
