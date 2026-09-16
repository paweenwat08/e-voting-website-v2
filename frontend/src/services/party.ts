export async function getParties() {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/parties`);
  return await response.json();
}