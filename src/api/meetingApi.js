import api from "./axios";
import {
  getBackendUserId,
  extractUserIdFromData,
  cacheBackendUserId,
} from "./userApi";

export const getMeetings = async (params = {}) => {
  const res = await api.get("/meetings/", { params });
  const data = res.data;
  if (!getBackendUserId()) {
    const id = extractUserIdFromData(Array.isArray(data) ? data : []);
    if (id) cacheBackendUserId(id);
  }
  return data;
};

export const getMeeting = async (id) => (await api.get(`/meetings/${id}`)).data;

export const createMeeting = async (data) => {
  const userId = getBackendUserId();
  let end_time = data.end_time;
  if (!end_time && data.start_time && data.duration_minutes) {
    const s = new Date(data.start_time);
    s.setMinutes(s.getMinutes() + Number(data.duration_minutes));
    end_time = s.toISOString();
  }
  const res = await api.post("/meetings/", {
    ...data,
    end_time,
    ...(userId ? { organizer_user_id: userId } : {}),
  });
  return res.data;
};

export const updateMeeting = async (id, data) => {
  const userId = getBackendUserId();
  let end_time = data.end_time;
  if (!end_time && data.start_time && data.duration_minutes) {
    const s = new Date(data.start_time);
    s.setMinutes(s.getMinutes() + Number(data.duration_minutes));
    end_time = s.toISOString();
  }
  const res = await api.put(`/meetings/${id}`, {
    ...data,
    end_time,
    ...(userId ? { organizer_user_id: userId } : {}),
  });
  return res.data;
};

export const deleteMeeting = async (id) =>
  (await api.delete(`/meetings/${id}`)).data;
