import api from "./axios";
import { auth } from "../firebase";

const CACHE_KEY = "amzeno_backend_user_id";

// Extract UUID from any existing resource that contains it
export const extractUserIdFromData = (data) => {
  if (!data) return null;
  const list = Array.isArray(data) ? data : [data];
  for (const item of list) {
    const id =
      item?.created_by_user_id || item?.user_id || item?.organizer_user_id;
    if (id && typeof id === "string" && id.includes("-")) {
      return id; // valid UUID format contains dashes
    }
  }
  return null;
};

export const cacheBackendUserId = (id) => {
  if (id) localStorage.setItem(CACHE_KEY, id);
};

export const getBackendUserId = () => {
  return localStorage.getItem(CACHE_KEY) || null;
};

export const createOrSyncUser = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    const res = await api.post("/users/", {
      firebase_uid: user.uid,
      display_name: user.displayName || "",
      email: user.email || "",
      photo_url: user.photoURL || "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    // First-time signup — store the UUID
    if (res.data?.id) {
      cacheBackendUserId(res.data.id);
    }
    return res.data;
  } catch (e) {
    // 409 = already exists, UUID must come from existing data
    if (e.response?.status === 409) return null;
    console.error("User sync failed:", e);
    return null;
  }
};

export const updateMe = async (data) => {
  const id = getBackendUserId();
  if (!id) return null;
  try {
    return (await api.put(`/users/${id}`, data)).data;
  } catch (e) {
    console.error(e);
  }
};
