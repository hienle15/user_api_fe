const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const API_ENDPOINTS = {
  USERS: `${BASE_URL}/users`,
  PROJECTS: `${BASE_URL}/projects`,
  // Thêm các endpoints khác tại đây
};

// Ví dụ sử dụng:
// axios.get(API_ENDPOINTS.USERS);