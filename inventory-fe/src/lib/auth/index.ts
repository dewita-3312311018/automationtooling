const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const getAccessToken = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(ACCESS_TOKEN_KEY) || undefined;
};

const setAccessToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

const getRefreshToken = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem(REFRESH_TOKEN_KEY) || undefined;
};

const setRefreshToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

const clearTokens = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const isAuthenticated = (): boolean => {
  return typeof window !== "undefined" && !!getAccessToken();
};

const logout = (): void => {
  clearTokens();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

const getAuthToken = (): string | undefined => {
  return getAccessToken();
};

export {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  clearTokens,
  isAuthenticated,
  logout,
  getAuthToken,
};
