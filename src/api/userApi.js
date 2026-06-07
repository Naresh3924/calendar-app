import api from "./axios";
import { auth } from "../firebase";

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
    return res.data;
  } catch (e) {
    // 409 = user already exists, 422 = validation — both are fine, just skip
    if (e.response?.status === 409 || e.response?.status === 422) return null;
    console.error("User sync failed:", e);
    return null;
  }
};

export const getMe = async () => {
  const res = await api.get("/users/me");
  return res.data;
};

export const updateMe = async (data) => {
  const res = await api.put("/users/me", data);
  return res.data;
};
