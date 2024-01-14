export async function deleteRecipe(title: string) {
  try {
    const response = await fetch(`/api/deleteRecipe?title=${title}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Failed to delete recipe:", error);
  }
}
