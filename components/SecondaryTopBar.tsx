"use client";
import React, { useEffect, useState } from "react";
import { Meal } from "./MealCard";
import { getMeal } from "../utils/api";
import { defaultChatHistory, useAppState } from "./AppStateContext";
import { generateRecipe } from "@/utils/meal";

type props = {
  setMeals: (meals: Meal[]) => void;
};

const SecondaryTopBar: React.FC = (props) => {
  const {
    meals,
    setMeals,
    chatHistory,
    setChatHistory,
    numberOfMeals,
    setNumberOfMeals,
    generating,
    setGenerating,
  } = useAppState();

  const [groceryStore, setGroceryStore] = useState("metro");
  const [response, setResponse] = useState("");

  const [generateTries, setGenerateTries] = useState(0);

  const handleGenerate = async () => {
    setGenerating(true);
    await generateRecipe((status, progress) => setResponse(status + " " + progress * 100 + "%"));
    setGenerating(false);
  };

  return (
    <div className="bg-white shadow-md py-6 px-6 flex justify-center items-center">
      <div className="flex items-center justify-around w-full max-w-4xl">
        <div className="flex-grow mr-4">
          <label htmlFor="number-of-meals" className="block text-gray-700 font-bold mb-2">
            Number of Meals
          </label>
          <select
            id="number-of-meals"
            value={numberOfMeals}
            onChange={(e) => setNumberOfMeals(parseInt(e.target.value))}
            className="w-full bg-gray-200 text-gray-700 border rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          >
            {[...Array(7)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-grow mr-4">
          <label htmlFor="grocery-store" className="block text-gray-700 font-bold mb-2">
            Grocery Store
          </label>
          <select
            id="grocery-store"
            value={groceryStore}
            onChange={(e) => setGroceryStore(e.target.value)}
            className="w-full bg-gray-200 text-gray-700 border rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          >
            <option value="metro">Metro</option>
            <option value="loblaws" disabled>
              Loblaws
            </option>
            <option value="no_frills" disabled>
              No Frills
            </option>
            <option value="walmart" disabled>
              Walmart
            </option>
            <option value="farmboy" disabled>
              Farmboy
            </option>
          </select>
        </div>

        <div className="flex-grow">
          <div className="text-dark-gray font-bold mb-2">Meal Plan</div>
          <button
            onClick={handleGenerate}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full"
          >
            {generating ? response : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecondaryTopBar;
