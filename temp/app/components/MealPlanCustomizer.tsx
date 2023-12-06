"use client";
import React, { useState } from "react";

const foodGenres = [
  "Italian",
  "Chinese",
  "Indian",
  "Mexican",
  "Vegan",
  "Seafood",
  "Desserts",
  "BBQ",
]; // Add more as needed

const MealCustomizationCard: React.FC = () => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [otherPreference, setOtherPreference] = useState("");

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  return (
    <div className="rounded-lg overflow-hidden shadow-blurry bg-white z-10">
      <div className="bg-gray-700 text-white text-lg font-bold p-4">Food Preferences</div>
      <div className=" p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {foodGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              className={`px-3 py-1 text-sm font-semibold rounded-full border ${
                selectedGenres.includes(genre) ? "bg-gray-600 text-white" : "bg-white text-gray-600"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={otherPreference}
          onChange={(e) => setOtherPreference(e.target.value)}
          placeholder="Other..."
          className="w-full p-2 border rounded text-gray-600"
        />
      </div>
    </div>
  );
};

export default MealCustomizationCard;
