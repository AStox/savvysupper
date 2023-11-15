import React from "react";
import MealCard from "./MealCard";

// Assume data is passed as a prop for now; later it could be fetched from an API
const MealPlan = ({ meals }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {meals.map((meal) => (
        <MealCard key={meal.id} meal={meal} />
      ))}
    </div>
  );
};

export default MealPlan;
