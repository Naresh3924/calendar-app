import api from "./axios";

export const getAnalytics = async () =>
  (await api.get("/analytics/summary")).data;
export const getProductivityScore = async () =>
  (await api.get("/analytics/productivity")).data;
export const getWeeklyActivity = async () =>
  (await api.get("/analytics/weekly")).data;
