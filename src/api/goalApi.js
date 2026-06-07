import api from "./axios";

export const getGoals = async (params = {}) => {
  const res = await api.get("/goals/", { params });
  return res.data;
};

export const createGoal = async (data) => {
  const res = await api.post("/goals/", data);
  return res.data;
};

export const updateGoal = async (id, data) => {
  const res = await api.put(`/goals/${id}`, data);
  return res.data;
};

export const deleteGoal = async (id) => {
  const res = await api.delete(`/goals/${id}`);
  return res.data;
};
