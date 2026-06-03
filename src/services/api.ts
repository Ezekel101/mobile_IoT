const BASE_URL = 'http://192.168.43.19:3000';

export const loginPatient = async (mail: string, password: string) => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mail, password }),
  });
  return response.json();
};