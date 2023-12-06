import Image from "next/image";
import React from "react";

const PlaceholderMealCard: React.FC = () => {
  return (
    <div className="relative max-w-sm rounded-lg overflow-hidden h-72 shadow-blurry z-10 animate-pulse">
      <Image src="/placeholderRecipe.png" alt="Placeholder Meal" layout="fill" objectFit="cover" />
      <div className="absolute top-0 left-0 right-0 bg-gray-700 p-2">
        <h3 className="text-lg font-bold text-white">Generating Recipe...</h3>
      </div>
    </div>
  );
};

export default PlaceholderMealCard;
