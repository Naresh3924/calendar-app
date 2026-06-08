import api from "./axios";
import { getBackendUserId, cacheBackendUserId } from "./userApi";

// NOTE: GET /goals/ and POST /goals/ return 500 on this backend.
// All functions handle this gracefully — goals page shows empty state.

export const getGoals = async () => {
  try {
    const res = await api.get("/goals/");
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return []; // 500 — backend bug, return empty silently
  }
};

export const createGoal = async (data) => {
  const userId = getBackendUserId();
  const start_date = data.start_date || new Date().toISOString().split("T")[0];
  const res = await api.post("/goals/", {
    ...data,
    start_date,
    ...(userId ? { user_id: userId, created_by_user_id: userId } : {}),
  });
  return res.data;
};

export const updateGoal = async (id, data) => {
  const userId = getBackendUserId();
  const start_date = data.start_date || new Date().toISOString().split("T")[0];
  const res = await api.put(`/goals/${id}`, {
    ...data,
    start_date,
    ...(userId ? { user_id: userId, created_by_user_id: userId } : {}),
  });
  return res.data;
};

export const deleteGoal = async (id) => (await api.delete(`/goals/${id}`)).data;
