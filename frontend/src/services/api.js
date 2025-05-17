import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const publicRoutes = ["/users/login"];

  // Check if the request is to a public route
  const isPublic = publicRoutes.some((route) => config.url.includes(route));

  if (!isPublic) {
    const token = localStorage.getItem("token"); // or sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});


export const loginUser = (data) => api.post("/users/login", data);

export const fetchInvoices = (params) => api.get("/invoice", { params });
export const createInvoice = (data) => api.post("/invoice/create", data);
export const updateInvoice = (id, data) =>
  api.put(`/invoice/:invoiceNumber`, data);
export const deleteInvoices = (ids) =>
  api.delete("/invoice/delete", { data: { ids } });

export const fetchUsers = (params) => api.get("/users", { params });
export const createUser = (data) => api.post("/users/create", data);
export const updateUserRole = (id, data) => api.put(`/users/${id}/role`, data);
export const deleteUsers = (ids) => api.delete("/users/:id", { data: { ids } });

export default api;
