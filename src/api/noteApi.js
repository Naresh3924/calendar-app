import api from "./axios";

export const getNotes = async (p = {}) =>
  (await api.get("/notes/", { params: p })).data;
export const getNote = async (id) => (await api.get(`/notes/${id}`)).data;
export const createNote = async (d) => (await api.post("/notes/", d)).data;
export const updateNote = async (id, d) =>
  (await api.put(`/notes/${id}`, d)).data;
export const deleteNote = async (id) => (await api.delete(`/notes/${id}`)).data;
