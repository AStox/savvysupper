// app/components/MealPlan.tsx
import React from "react";
import MealCard from "./MealCard";
import type { Meal } from "./MealCard"; // Assuming you define a Meal type in MealCard

interface MealPlanProps {
  meals: Meal[];
}

const MealPlan: React.FC<MealPlanProps> = ({ meals }) => {
  return (
    <div className="container mx-auto my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meals.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </div>
    </div>
  );
};

export default MealPlan;
