const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const getAccessToken = (): string | undefined => {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || undefined;
};

const setAccessToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

const getRefreshToken = (): string | undefined => {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || undefined;
};

const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

const logout = (): void => {
  clearTokens();
  window.location.href = "/login";
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
