import React from "react";
import Image from "next/image";
import { Meal } from "./MealCard";

interface RecipeModalProps {
  meal: Meal;
  onClose: () => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ meal, onClose }) => {
  console.log("meal", meal);
  const calculateTotal = (pricing: { name: string; savings: number; cost: number }[]) => {
    return pricing.reduce((acc, item) => acc + item.cost, 0);
  };

  const calculateSavings = (pricing: { name: string; savings: number; cost: number }[]) => {
    return pricing.reduce((acc, item) => acc + item.savings, 0);
  };

  const findIngredientPrice = (ingredientName: string) => {
    const ingredient = meal.pricing.find((item) =>
      ingredientName.toLowerCase().includes(item.name.toLowerCase())
    );
    return ingredient && ingredient.cost > 0 ? `$${ingredient.cost.toFixed(2)}` : "";
  };

  const findIngredientSavings = (ingredientName: string) => {
    const ingredient = meal.pricing.find((item) =>
      ingredientName.toLowerCase().includes(item.name.toLowerCase())
    );
    return ingredient && ingredient.savings > 0 ? `$${ingredient.savings.toFixed(2)}` : "";
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-3/4 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
        <div className="flex flex-col items-center space-y-4">
          <Image
            src={meal.image}
            alt={meal.title}
            width={300}
            height={200}
            className="rounded-md"
          />
          <h2 className="text-2xl font-bold text-gray-800">{meal.title}</h2>

          <div className="text-left w-full">
            <h3 className="text-lg font-semibold text-gray-700">Ingredients</h3>
            <ul className="list-disc pl-5">
              {meal.ingredients.map((ingredient, index) => (
                <li key={index} className="text-gray-600">
                  {ingredient}{" "}
                  {findIngredientPrice(ingredient) && (
                    <span className="text-gray-500">
                      (Cost: {findIngredientPrice(ingredient)}, Save:{" "}
                      {findIngredientSavings(ingredient)})
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <h3 className="text-lg font-semibold text-gray-700">Instructions</h3>
            <ol className="list-decimal pl-5">
              {meal.instructions.map((instruction, index) => (
                <li key={index} className="text-gray-600">
                  {instruction}
                </li>
              ))}
            </ol>

            <div className="mt-4 text-gray-700">
              <p>
                Total Cost:{" "}
                <span className="font-semibold">${calculateTotal(meal.pricing).toFixed(2)}</span>
              </p>
              <p>
                Total Savings:{" "}
                <span className="font-semibold">${calculateSavings(meal.pricing).toFixed(2)}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;
