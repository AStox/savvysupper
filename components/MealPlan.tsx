"use client";
import React, { useEffect, useState } from "react";
import MealCard from "./MealCard";
import { useAppState } from "./AppStateContext";
import RecipeModal from "./RecipeModal";
import { Recipe } from "@/utils/meal";

const MealPlan: React.FC = () => {
  const [selectedMeal, setSelectedMeal] = useState<Recipe | null>(null);
  const { meals } = useAppState();
  console.log("meals", meals);
  const recipes = meals;

  const handleMealSelect = (meal: Recipe) => {
    setSelectedMeal(meal);
  };

  const handleCloseModal = () => {
    setSelectedMeal(null);
  };

  return (
    <div className="container mx-auto px-4 py-32 md:px-8 lg:px-16">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {recipes?.map((recipe) => (
          <MealCard
            key={recipe.id}
            meal={recipe}
            onReroll={() => {}}
            onSelect={() => handleMealSelect(recipe)}
          />
        ))}
      </div>
      {selectedMeal && <RecipeModal meal={selectedMeal} onClose={handleCloseModal} />}
    </div>
  );
};

export default MealPlan;
