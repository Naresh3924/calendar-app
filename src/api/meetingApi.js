import api from "./axios";

export const getMeetings = async (p = {}) =>
  (await api.get("/meetings/", { params: p })).data;
export const getMeeting = async (id) => (await api.get(`/meetings/${id}`)).data;
export const createMeeting = async (d) =>
  (await api.post("/meetings/", d)).data;
export const updateMeeting = async (id, d) =>
  (await api.put(`/meetings/${id}`, d)).data;
export const deleteMeeting = async (id) =>
  (await api.delete(`/meetings/${id}`)).data;
