async function getMealRecipe(mealCount: number = 1): Promise<string[]> {
  try {
    const response = await fetch("https://savvysupper.vercel.app/api/GetMeal");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json(); // or response.text() if the response is plain text
    console.log(data); // Process the response data
  } catch (error) {
    console.error("Error:", error);
  }
}

export { getMeal };
