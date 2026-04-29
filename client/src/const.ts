export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Redirects to the server-side Google OAuth initiation route.
export const getLoginUrl = () => "/api/auth/google";
