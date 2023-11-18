"use client";
import React, { useEffect, useState } from "react";
import MealCard from "./MealCard";
import MealCustomizationCard from "./MealPlanCustomizer";
import WeeklySummaryCard from "./MealPlanSummary";
import type { Meal } from "./MealCard";
import { useAppState } from "./AppStateContext";
import PlaceholderMealCard from "./PlaceholderMealCard";
import RecipeModal from "./RecipeModal";

const MealPlan = () => {
  const { meals, setMeals, generating } = useAppState();
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  useEffect(() => {
    console.log("meals", meals);
  }, [meals]);

  const handleMealSelect = (meal: Meal) => {
    setSelectedMeal(meal);
  };

  const handleCloseModal = () => {
    setSelectedMeal(null);
  };

  return (
    <div className="container mx-auto px-4 py-32 md:px-8 lg:px-16">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onReroll={() => {}}
            onSelect={() => handleMealSelect(meal)}
          />
        ))}
        {generating && <PlaceholderMealCard />}
        <MealCard
          key="meal"
          meal={dummyMeal}
          onReroll={() => {}}
          onSelect={() => handleMealSelect(dummyMeal)}
        />
        <MealCustomizationCard key="customization" />
        <WeeklySummaryCard
          key="summary"
          totalCost={meals.reduce((acc, meal) => acc + meal.cost, 0)}
          totalSavings={meals.reduce((acc, meal) => acc + meal.savings, 0)}
        />
      </div>
      {selectedMeal && <RecipeModal meal={selectedMeal} onClose={handleCloseModal} />}
    </div>
  );
};

export default MealPlan;

const dummyMeal: Meal = {
  id: 0,
  image: "/RedBeansRice.png",
  cost: 10.99,
  savings: 2.99,
  title: "Sweet Potato and Chicken Hash",
  ingredients: [
    "2 sweet potatoes",
    "4 chicken breasts",
    "1 red onion",
    "1 zucchini",
    "1 head of broccoli",
    "1/2 cup of cooked brown rice",
    "1/4 cup of olive oil",
    "1/2 teaspoon of salt",
    "1/4 teaspoon of black pepper",
  ],
  instructions: [
    "Preheat oven to 425°F.",
    "Chop all vegetables.",
    "In a large bowl, toss sweet potatoes, zucchini, onion, and broccoli with olive oil, salt, and pepper.",
    "Spread the vegetables on a baking sheet and roast in the oven for 25 minutes.",
    "Cook the brown rice as per the instructions on the package.",
    "Meanwhile, heat a large non-stick skillet over medium-high heat and cook the chicken breasts for 6-8 minutes on each side or until cooked through.",
    "Once the vegetables are roasted, add the rice and chicken to the bowl and toss to combine.",
    "Serve immediately and enjoy!",
  ],
  pricing: [
    { name: "Sweet Potato", cost: 1.12, savings: 3.27 },
    { name: "Chicken Breast", cost: 4.61, savings: 18.52 },
    { name: "Red Onion", cost: 1.32, savings: 4.61 },
    { name: "Zucchini", cost: 1.08, savings: 4.85 },
    { name: "Broccoli", cost: 0, savings: 0 },
    { name: "Brown Rice", cost: 0, savings: 0 },
    { name: "Olive Oil", cost: 0, savings: 0 },
    { name: "Salt", cost: 0, savings: 0 },
    { name: "Black Pepper", cost: 0, savings: 0 },
  ],
};
