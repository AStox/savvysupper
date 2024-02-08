import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import React from "react";
import { Ingredient } from "@/pages/api/ingredientScraper";
import { Recipe } from "@/utils/generateRecipe";

interface MealCardProps {
  meal: Recipe;
  onReroll: () => void;
  onSelect: (meal: Recipe) => void;
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
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center bg-slate-500">
        <h3 className="text-md font-bold text-white m-auto px-1 py-2">{meal.title}</h3>
      </div>
      <div className="absolute bottom-0 px-2">
        {meal.dietaryRestrictions.map((restriction) => (
          <span
            key={restriction}
            className="inline-block bg-green-200 rounded-full px-2 text-sm font-semibold mr-2 mb-2"
          >
            {restriction}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MealCard;
