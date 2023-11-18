"use client";
import React, { useEffect, useState } from "react";
import MealCard from "./MealCard";
import MealCustomizationCard from "./MealPlanCustomizer";
import WeeklySummaryCard from "./MealPlanSummary";
import type { Meal } from "./MealCard";
import { useAppState } from "./AppStateContext";
import PlaceholderMealCard from "./PlaceholderMealCard";

const MealPlan = () => {
  const { meals, setMeals, generating } = useAppState();

  useEffect(() => {
    console.log("meals", meals);
  }, [meals]);

  return (
    <div className="container mx-auto px-4 py-32 md:px-8 lg:px-16">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {meals.map((meal) => (
          <MealCard key={meal.id} meal={meal} onReroll={() => {}} />
        ))}
        {generating && <PlaceholderMealCard />}
        <MealCustomizationCard key="customization" />
        <WeeklySummaryCard
          key="summary"
          totalCost={meals.reduce((acc, meal) => acc + meal.cost, 0)}
          totalSavings={meals.reduce((acc, meal) => acc + meal.savings, 0)}
        />
      </div>
    </div>
  );
};

export default MealPlan;
