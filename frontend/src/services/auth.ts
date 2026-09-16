export async function login(studentId: string, password: string) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/v1/voters/login`, 
    {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      studentId,
      password,
    }),
  });

  return await response.json();
}