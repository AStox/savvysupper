import React, { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import MealPlan from "../components/MealPlan";
import { Meal } from "../components/MealCard"; // Import the Meal interface
import SecondaryTopBar from "../components/SecondaryTopBar";
import { AppStateProvider, useAppState } from "../components/AppStateContext";

// Define your mock data with types
const mockMeals: Meal[] = [
  // Populate with mock meal data according to the Meal interface
  {
    id: 1,
    image: "/RedBeansRice.png",
    title: "Meal Title",
    ingredients: ["Ingredient 1", "Ingredient 2"],
    instructions: ["Instruction 1", "Instruction 2"],
    pricing: [],
    cost: 10.99,
    savings: 2.99,
  },
];

const Home = () => {
  const { meals } = useAppState();

  const totalCost = mockMeals.reduce((acc, meal) => acc + meal.cost, 0); // Example calculation
  const totalSavings = mockMeals.reduce((acc, meal) => acc + meal.savings, 0); // Example calculation

  return (
    <AppStateProvider>
      <div>
        <TopBar />
        <SecondaryTopBar />
        <MealPlan />
      </div>
    </AppStateProvider>
  );
};

export default Home;
