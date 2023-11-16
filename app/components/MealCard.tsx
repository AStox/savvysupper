import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo, faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import React from "react";

export interface Meal {
  id: number;
  image: string;
  title: string;
  cost: number;
  savings: number;
}

interface MealCardProps {
  meal: Meal;
  onReroll: () => void;
}

const MealCard: React.FC<MealCardProps> = ({ meal, onReroll }) => {
  return (
    <div className="relative max-w-sm rounded-lg overflow-hidden h-72 shadow-blurry z-10">
      <Image src={meal.image} alt={meal.title} layout="fill" objectFit="cover" />
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-700">{meal.title}</h3>
          <button
            onClick={onReroll}
            className="text-white bg-gray-800 hover:bg-gray-700 rounded-full p-1 flex items-center justify-center"
            style={{ width: "24px", height: "24px" }}
          >
            <FontAwesomeIcon icon={faRedo} />
          </button>
        </div>
        <div>
          <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
            Cost: ${meal.cost.toFixed(2)}
          </span>
          <span className="inline-block bg-green-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
            Save: ${meal.savings.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MealCard;
