"use client";
import React, { useEffect, useState } from "react";
import MealCard from "./MealCard";
import MealCustomizationCard from "./MealPlanCustomizer";
import WeeklySummaryCard from "./MealPlanSummary";
import type { Meal } from "./MealCard";
import { useAppState } from "./AppStateContext";
import PlaceholderMealCard from "./PlaceholderMealCard";
import RecipeModal from "./RecipeModal";
import prisma from "../lib/prisma";
import { GetStaticProps } from "next";

type Props = {
  recipes: any[];
};

const MealPlan: React.FC<Props> = (props) => {
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  const recipes = props.recipes;

  const handleMealSelect = (meal: Meal) => {
    setSelectedMeal(meal);
  };

  const handleCloseModal = () => {
    setSelectedMeal(null);
  };

  return (
    <div className="container mx-auto px-4 py-32 md:px-8 lg:px-16">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {recipes?.map((recipe) => (
          <MealCard
            key={recipe.id}
            meal={recipe}
            onReroll={() => {}}
            onSelect={() => handleMealSelect(recipe)}
          />
        ))}
        <MealCustomizationCard key="customization" />
        <WeeklySummaryCard
          key="summary"
          totalCost={recipes?.reduce((acc, recipe) => acc + recipe.cost, 0)}
          totalSavings={recipes?.reduce((acc, recipe) => acc + recipe.savings, 0)}
        />
      </div>
      {selectedMeal && <RecipeModal meal={selectedMeal} onClose={handleCloseModal} />}
    </div>
  );
};

export default MealPlan;
