export async function fetchSaleProteins(): Promise<any[]> {
  const response = await fetch(`/api/getSaleItems`);
  if (!response.ok) {
    console.log("RESPONSE NOT OK:", response);
  }
  const data: any[] = await response.json();
  // shuffle the order of the items in data and return the first 25
  for (let i = data.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [data[i], data[j]] = [data[j], data[i]];
  }
  return data.slice(0, 15) as any[];
}
