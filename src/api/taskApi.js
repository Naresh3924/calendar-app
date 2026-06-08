import api from "./axios";
import { getBackendUserId, cacheBackendUserId } from "./userApi";

// Scan task objects for a backend UUID
function findUUID(items) {
  const fields = [
    "created_by_user_id",
    "user_id",
    "owner_id",
    "assigned_to",
    "created_by",
    "organizer_user_id",
  ];
  for (const item of Array.isArray(items) ? items : []) {
    for (const f of fields) {
      const v = item?.[f];
      // UUID format: 8-4-4-4-12 hex chars with dashes
      if (v && typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v)) return v;
    }
  }
  return null;
}

export const getTasks = async (params = {}) => {
  const res = await api.get("/tasks/", { params });
  const data = res.data;
  const list = Array.isArray(data) ? data : [];

  // Auto-cache UUID if not yet stored
  if (!getBackendUserId() && list.length > 0) {
    const uuid = findUUID(list);
    if (uuid) {
      cacheBackendUserId(uuid);
      console.log("✅ UUID cached from tasks:", uuid);
    } else {
      // Log first task fields so we can identify the UUID field manually
      console.log("📋 First task object:", JSON.stringify(list[0]));
    }
  }

  return list;
};

export const getTask = async (id) => (await api.get(`/tasks/${id}`)).data;

export const createTask = async (data) => {
  const userId = getBackendUserId();
  const res = await api.post("/tasks/", {
    ...data,
    ...(userId ? { created_by_user_id: userId } : {}),
  });
  return res.data;
};

export const updateTask = async (id, data) => {
  const userId = getBackendUserId();
  const res = await api.put(`/tasks/${id}`, {
    ...data,
    ...(userId ? { created_by_user_id: userId } : {}),
  });
  return res.data;
};

export const deleteTask = async (id) => (await api.delete(`/tasks/${id}`)).data;
