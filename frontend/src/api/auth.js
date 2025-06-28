// src/api/auth.js
import axios from "axios";

const BASE_URL = "https://frontend-test-api.aircall.dev";

// Simple refresh promise to prevent race conditions
let refreshPromise = null;

// Log in and store tokens + user info
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username,
      password,
    });

    const { access_token, refresh_token, user } = response.data;

    // Save token and set an internal "expiration" to refresh before 10 mins
    const expiresAt = Date.now() + 9 * 60 * 1000;

    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    localStorage.setItem("token_expires_at", expiresAt);
    localStorage.setItem("user", JSON.stringify(user));

    return { access_token, user };
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

// Handles refreshing the access token if needed
export const refreshToken = async () => {
  // If already refreshing, wait for that promise
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return;

  // Create new refresh promise
  refreshPromise = (async () => {
    try {
      const response = await axios.post(`${BASE_URL}/auth/refresh-token`, null, {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      const { access_token, refresh_token: newRefreshToken } = response.data;

      // Save new token and update expiration
      const expiresAt = Date.now() + 9 * 60 * 1000;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", newRefreshToken);
      localStorage.setItem("token_expires_at", expiresAt);

      return access_token;
    } catch (error) {
      // If refresh fails, just log out and kick to login
      logoutUser();
      window.location.href = "/";
      return null;
    } finally {
      // Clear the promise so next refresh can happen
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// Clears everything out on logout
export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  localStorage.removeItem("token_expires_at");
};

// Attach auth header for API calls
export const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Auto handles token refresh logic around API requests
export const axiosWithAutoRefresh = async (axiosFn) => {
  const expiresAt = parseInt(localStorage.getItem("token_expires_at"), 10);
  const now = Date.now();

  // If the token is close to expiry (within 120s), refresh it first
  if (expiresAt && now >= expiresAt - 2 * 60 * 1000) {
    await refreshToken();
  }

  try {
    return await axiosFn();
  } catch (error) {
    // If request fails due to 401, try refreshing once and retry
    if (error.response?.status === 401) {
      const newToken = await refreshToken();
      if (!newToken) throw error;
      return await axiosFn();
    }
    throw error;
  }
};
