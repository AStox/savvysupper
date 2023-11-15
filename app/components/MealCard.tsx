// app/components/MealCard.tsx
import Image from "next/image";
import React from "react";

const MealCard = ({ meal }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg">
      <Image src={meal.image} alt={meal.title} className="w-full h-32 sm:h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-bold">{meal.title}</h3>
        <p className="text-sm text-gray-600">{meal.ingredients}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm font-medium">Cost: {meal.cost}</span>
          <span className="text-sm font-medium text-green-600">Save: {meal.savings}</span>
        </div>
      </div>
    </div>
  );
};

export default MealCard;
