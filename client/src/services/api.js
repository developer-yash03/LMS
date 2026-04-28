const BASE_URL = import.meta.env.VITE_API_URL;

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

export const uploadMedia = async (file) => {
  const token = localStorage.getItem("lms_token");
  const formData = new FormData();
  formData.append("file", file);

  const headers = {
    ...(token && { "Authorization": `Bearer ${token}` }),
  };

  try {
    const response = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Upload failed");
    return data;
  } catch (error) {
    console.error("Upload Error:", error);
    throw error;
  }
};