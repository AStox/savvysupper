import React from "react";

interface WeeklySummaryProps {
  totalCost: number;
  totalSavings: number;
}

const WeeklySummaryCard: React.FC<WeeklySummaryProps> = ({ totalCost, totalSavings }) => {
  return (
    <div className="rounded-lg shadow-blurry overflow-hidden bg-white z-10">
      <div className="bg-gray-700 text-white text-lg font-bold p-4">Weekly Summary</div>
      <div className="p-4">
        <div className="mb-2">
          <span className="text-gray-700 font-semibold">Total Cost: </span>
          <span className="font-bold text-gray-700">${totalCost?.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-gray-700 font-semibold">Total Savings: </span>
          <span className="font-bold text-gray-700">${totalSavings?.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklySummaryCard;
