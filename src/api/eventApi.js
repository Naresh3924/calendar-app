import api from "./axios";
import {
  getBackendUserId,
  extractUserIdFromData,
  cacheBackendUserId,
} from "./userApi";

export const getEvents = async (params = {}) => {
  const res = await api.get("/events/", { params });
  const data = res.data;
  if (!getBackendUserId()) {
    const id = extractUserIdFromData(Array.isArray(data) ? data : []);
    if (id) cacheBackendUserId(id);
  }
  return data;
};

export const getEvent = async (id) => (await api.get(`/events/${id}`)).data;

export const createEvent = async (data) => {
  const userId = getBackendUserId();
  const res = await api.post("/events/", {
    ...data,
    ...(userId
      ? { created_by_user_id: userId, organizer_user_id: userId }
      : {}),
  });
  return res.data;
};

export const updateEvent = async (id, data) => {
  const userId = getBackendUserId();
  const res = await api.put(`/events/${id}`, {
    ...data,
    ...(userId
      ? { created_by_user_id: userId, organizer_user_id: userId }
      : {}),
  });
  return res.data;
};

export const deleteEvent = async (id) =>
  (await api.delete(`/events/${id}`)).data;
