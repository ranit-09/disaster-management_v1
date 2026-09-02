import axios from "axios";

/**
 * Same-origin API routes, so no baseURL needed — this exists mainly so
 * every page imports one configured instance instead of calling the
 * axios default export directly, giving us one place to add interceptors,
 * timeouts, or auth headers later.
 */
export const api = axios.create({
  headers: { "Content-Type": "application/json" },
});

export default api;
