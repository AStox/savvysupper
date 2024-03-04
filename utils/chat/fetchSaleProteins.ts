export async function fetchSaleProteins() {
  try {
    const response = await fetch(`/api/getSaleProteins`);
    if (!response.ok) {
      console.log("RESPONSE NOT OK:", response);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching search results:", error);
    return null;
  }
}
