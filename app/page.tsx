// pages/index.tsx
import React from "react";
import TopBar from "../app/components/TopBar";
import MealPlan from "../app/components/MealPlan";

// Mock data for meal plans
const mockMeals = [];

const Home = () => {
  return (
    <div>
      <TopBar />
      <MealPlan meals={mockMeals} />
    </div>
  );
};

export default Home;
