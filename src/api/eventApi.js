import api from "./axios";

// GET /events/
export const getEvents = async (params = {}) => {
  const res = await api.get("/events/", { params });
  return res.data;
};

// GET /events/:id
export const getEvent = async (id) => {
  const res = await api.get(`/events/${id}`);
  return res.data;
};

// POST /events/
export const createEvent = async (data) => {
  const res = await api.post("/events/", data);
  return res.data;
};

// PUT /events/:id
export const updateEvent = async (id, data) => {
  const res = await api.put(`/events/${id}`, data);
  return res.data;
};

// DELETE /events/:id
export const deleteEvent = async (id) => {
  const res = await api.delete(`/events/${id}`);
  return res.data;
};
