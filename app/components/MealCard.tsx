// app/components/MealCard.tsx
import Image from "next/image";
import React from "react";

export interface Meal {
  id: number;
  image: string;
  title: string;
  ingredients: string[];
  cost: number;
  savings: number;
}

interface MealCardProps {
  meal: Meal;
}

const MealCard: React.FC<MealCardProps> = ({ meal }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg">
      <Image src={meal.image} alt={meal.title} className="w-full h-32 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-bold">{meal.title}</h3>
        <ul className="text-sm text-gray-600">
          {meal.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm font-medium">Cost: ${meal.cost.toFixed(2)}</span>
          <span className="text-sm font-medium text-green-600">
            Save: ${meal.savings.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MealCard;
