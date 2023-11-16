import React from "react";
import TopBar from "../app/components/TopBar";
import MealPlan from "../app/components/MealPlan";
import { Meal } from "../app/components/MealCard"; // Import the Meal interface

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
  {
    id: 1,
    image: "/RedBeansRice.png",
    title: "Meal Title",
    ingredients: ["Ingredient 1", "Ingredient 2"],
    cost: 10.99,
    savings: 2.99,
  },
  {
    id: 1,
    image: "/RedBeansRice.png",
    title: "Meal Title",
    ingredients: ["Ingredient 1", "Ingredient 2"],
    cost: 10.99,
    savings: 2.99,
  },
  {
    id: 1,
    image: "/RedBeansRice.png",
    title: "Meal Title",
    ingredients: ["Ingredient 1", "Ingredient 2"],
    cost: 10.99,
    savings: 2.99,
  },
  {
    id: 1,
    image: "/RedBeansRice.png",
    title: "Meal Title",
    ingredients: ["Ingredient 1", "Ingredient 2"],
    cost: 10.99,
    savings: 2.99,
  },
  {
    id: 1,
    image: "/RedBeansRice.png",
    title: "Meal Title",
    ingredients: ["Ingredient 1", "Ingredient 2"],
    cost: 10.99,
    savings: 2.99,
  },
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
  const showSummary = true;
  const totalCost = mockMeals.reduce((acc, meal) => acc + meal.cost, 0); // Example calculation
  const totalSavings = mockMeals.reduce((acc, meal) => acc + meal.savings, 0); // Example calculation

  return (
    <div>
      <TopBar />
      <MealPlan
        meals={mockMeals}
        showSummary={showSummary}
        totalCost={totalCost}
        totalSavings={totalSavings}
      />
    </div>
  );
};

export default Home;
