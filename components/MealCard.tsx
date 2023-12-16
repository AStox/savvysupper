import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import React from "react";

export interface Meal {
  id: string;
  title: string;
  image: string;
  ingredients: Ingredient[];
  instructions: string[];
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  healthy: boolean;
  cheap: boolean;
  preparationMinutes: number;
  cookingMinutes: number;
  pricePerServing: number;
}

export interface Ingredient {
  id: string;
  name: string;
  image: string;
  amount: number;
  unit: string;
  pricePerUnit: number;
  currentPrice: number;
}

interface MealCardProps {
  meal: Meal;
  onReroll: () => void;
  onSelect: (meal: Meal) => void;
}

const MealCard: React.FC<MealCardProps> = ({ meal, onReroll, onSelect }) => {
  return (
    <div
      className="relative max-w-sm rounded-lg overflow-hidden h-72 shadow-blurry z-10 cursor-pointer"
      onClick={() => onSelect(meal)}
    >
      <Image
        src={meal.image ? meal.image : "/placeholderRecipe.png"}
        alt={meal.title}
        layout="fill"
        objectFit="cover"
      />
      <div className="absolute top-0 left-0 right-0 bg-gray-700 text-white p-2 flex justify-between items-center">
        <h3 className="text-lg font-bold">{meal.title}</h3>
        <button
          onClick={onReroll}
          className="text-white bg-transparent hover:bg-gray-600 rounded-full p-1"
          style={{ width: "24px", height: "24px" }}
        >
          <FontAwesomeIcon icon={faRedo} />
        </button>
      </div>
      <div className="absolute bottom-0 p-4">
        <div>
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
            Cost per Serving
          </span>
          <span className="inline-block bg-green-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
            ${meal.pricePerServing.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MealCard;
