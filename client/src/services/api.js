const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiRequest = async (endpoint, method = "GET", body = null) => {
  const token = localStorage.getItem("lms_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }),
  };

  const config = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  };

  try {
    const response = await fetch(`${BASE_URL}/api${endpoint}`, config);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Something went wrong");
    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};