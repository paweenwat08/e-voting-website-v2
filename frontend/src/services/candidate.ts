export async function getCandidates() {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/candidates`);
  return await response.json();
}