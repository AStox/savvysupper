import React from "react";
import Image from "next/image";
import { Recipe } from "@/utils/meal";
import { Ingredient } from "@prisma/client";

interface RecipeModalProps {
  meal: Recipe;
  onClose: () => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ meal, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      onClick={onClose}
    >
      <div
        className="relative top-20 mx-auto p-5 border w-4/5 md:w-3/4 lg:w-3/4 shadow-lg rounded-md bg-white"
        onClick={(e) => e.stopPropagation()}
      >
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
                  {ingredient.title}{" "}
                </li>
              ))}
              {meal.unpricedIngredients.map((ingredient, index) => (
                <li key={index} className="text-gray-600">
                  {ingredient.title}{" "}
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
