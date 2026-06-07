import api from "./axios";

// GET /tasks/
export const getTasks = async (params = {}) => {
  const res = await api.get("/tasks/", { params });
  return res.data;
};

// GET /tasks/:id
export const getTask = async (id) => {
  const res = await api.get(`/tasks/${id}`);
  return res.data;
};

// POST /tasks/
export const createTask = async (data) => {
  const res = await api.post("/tasks/", data);
  return res.data;
};

// PUT /tasks/:id
export const updateTask = async (id, data) => {
  const res = await api.put(`/tasks/${id}`, data);
  return res.data;
};

// DELETE /tasks/:id
export const deleteTask = async (id) => {
  const res = await api.delete(`/tasks/${id}`);
  return res.data;
};
