"use client";
import React, { useState } from "react";
import { useAppState } from "./AppStateContext";
import { DietaryRestrictions, generateRecipe } from "@/utils/generateRecipe";
import { Recipe } from "@/utils/generateRecipe";

type props = {
  setMeals: (meals: Recipe[]) => void;
};

const SecondaryTopBar: React.FC = (props) => {
  const { meals, setMeals, generating, setGenerating } = useAppState();

  const [response, setResponse] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryRestrictions[]>([]);
  const [mealCount, setMealCount] = useState(7);

  const handleGenerate = async () => {
    setGenerating(true);
    const recipe = await generateRecipe(dietaryRestrictions, (status, progress) =>
      setResponse(status + " " + progress * 100 + "%")
    );

    setMeals([...meals, recipe]);
    setGenerating(false);
  };

  const toggleDietaryRestriction = (restriction: DietaryRestrictions) => {
    setDietaryRestrictions((current) =>
      current.includes(restriction)
        ? current.filter((r) => r !== restriction)
        : [...current, restriction]
    );
  };

  const handleMealPlan = async () => {
    setGenerating(true);
    // choose [mealcount] recipes from prisma
    const recipes = await fetch("/api/mealPlan", {
      method: "POST",
      body: JSON.stringify({ mealCount, dietaryRestrictions }),
    }).then((res) => res.json());
    setMeals(recipes);
    setGenerating(false);
  };

  return (
    <div className=" shadow-md py-6 px-6 flex justify-center items-center">
      <div className="flex items-center justify-around w-full max-w-4xl">
        <div className="flex-grow mr-4">
          <label htmlFor="number-of-meals" className="block font-bold mb-2">
            Number of Meals
          </label>
          <select
            id="number-of-meals"
            value={mealCount}
            onChange={(e) => setMealCount(parseInt(e.target.value))}
            className="w-full border rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          >
            {[...Array(7)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-grow m-4">
          <div className="border-2 border-gray-300 p-4 rounded-md">
            <div className="font-bold mb-4">Dietary Restrictions</div>
            {Object.values(DietaryRestrictions).map((option) => (
              <div key={option} className="mb-2">
                <input
                  type="checkbox"
                  id={option}
                  name={option}
                  value={option}
                  onChange={() => toggleDietaryRestriction(option)}
                  className="mr-2"
                />
                <label htmlFor={option}>{option}</label>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-grow m-4">
          <div className="text-dark-gray font-bold mb-2">Meal Plan</div>
          <button
            onClick={handleMealPlan}
            className="bg-blue-500 hover:bg-blue-600 font-bold py-2 px-4 rounded w-full"
          >
            {generating ? "Thinking..." : "Plan it!"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecondaryTopBar;
