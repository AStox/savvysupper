type Unit = "kg" | "lbs" | "L";
type UnitsToIgnore = "tsp" | "tbsp" | "cup" | "oz" | "ml" | "g" | "count" | "ea" | "per";
type AllUnits = Unit | UnitsToIgnore;

export function convertMeasurement(input: string): { amount: number; units: string } {
  const unitMap: { [key in Unit]: number } = {
    kg: 1000, // 1 kg = 1000 grams
    lbs: 16, // 1 lb = 16 ounces
    L: 1000, // 1 L = 1000 milliliters
  };
  const convertedUnit: { [key in Unit]: string } = {
    kg: "g",
    lbs: "oz",
    L: "ml",
  };

  // Updated regular expression to match the number and unit, allowing for a space
  const regex = /([\d.]+)\s*([a-zA-Z]+)/;
  const matches = input.match(regex);

  if (matches && matches.length === 3) {
    const value = parseFloat(matches[1]);
    const unit = matches[2] as AllUnits;

    if (unit === "ea" || unit === "per") {
      return { amount: value, units: "count" };
    }
    if (unit in unitMap) {
      // Unit is one of the convertible types
      return { amount: value * unitMap[unit as Unit], units: convertedUnit[unit as Unit] };
    } else {
      // Unit is one of the non-convertible types (or unrecognized)
      return { amount: value, units: unit };
    }
  } else {
    console.log(input);
    throw new Error("Invalid input format");
  }
}
