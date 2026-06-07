import api from "./axios";

export const getReminders = async (p = {}) =>
  (await api.get("/reminders/", { params: p })).data;
export const createReminder = async (d) =>
  (await api.post("/reminders/", d)).data;
export const updateReminder = async (id, d) =>
  (await api.put(`/reminders/${id}`, d)).data;
export const deleteReminder = async (id) =>
  (await api.delete(`/reminders/${id}`)).data;
