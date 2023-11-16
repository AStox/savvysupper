"use client";
import React, { useEffect, useState } from "react";
import MealCard from "./MealCard";
import MealCustomizationCard from "./MealPlanCustomizer";
import WeeklySummaryCard from "./MealPlanSummary";
import type { Meal } from "./MealCard";

interface MealPlanProps {
  meals: Meal[];
  totalCost: number;
  totalSavings: number;
}

const MealPlan: React.FC<MealPlanProps> = ({ meals, totalCost, totalSavings }) => {
  return (
    <div className="container mx-auto px-4 py-32 md:px-8 lg:px-16">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {meals.map((meal) => (
          <MealCard key={meal.id} meal={meal} onReroll={() => {}} />
        ))}
        <MealCustomizationCard key="customization" />
        <WeeklySummaryCard key="summary" totalCost={totalCost} totalSavings={totalSavings} />
      </div>
    </div>
  );
};

export default MealPlan;
