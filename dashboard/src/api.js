import axios from "axios";
import { store } from "./store";
import {
  setToken as setReduxToken,
  setRefreshToken as setReduxRefreshToken,
  logout,
} from "./redux/slices/authSlice";
import {
  setAuthToken, // ⇒ writes access-token to localStorage + axios.defaults
  setRefreshToken as persistRefreshToken, // ⇒ writes refresh-token to localStorage
  clearTokens,
} from "./utils/setAuthToken";

/* ------------------------------------------------------------------ */
/* 1. AXIOS INSTANCE                                                  */
/* ------------------------------------------------------------------ */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "/api/v1",
});


/* ------------------------------------------------------------------ */
/* 2. IN-MEMORY SHADOW COPIES & REFRESH QUEUE                         */
/* ------------------------------------------------------------------ */
let currentToken = store.getState().auth.token;
let currentRefreshToken = store.getState().auth.refreshToken;
let isRefreshing = false;
let refreshSubscribers = []; // Queue for requests that arrive while refreshing

/* keep the shadow copies in-sync with Redux on every update */
store.subscribe(() => {
  const { token, refreshToken } = store.getState().auth;
  currentToken = token;
  currentRefreshToken = refreshToken;
});

/**
 * Helper to process the queue of requests waiting for a new access token.
 * If there's an error, all queued requests are rejected.
 * If a new token is provided, they are resolved.
 */
const processQueue = (error, token = null) => {
  refreshSubscribers.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  refreshSubscribers = [];
};

/* ------------------------------------------------------------------ */
/* 3. REQUEST INTERCEPTOR – add Bearer Token                          */
/* ------------------------------------------------------------------ */
api.interceptors.request.use(
  (config) => {
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

/* ------------------------------------------------------------------ */
/* 4. RESPONSE INTERCEPTOR – Handle Token Refresh & Errors            */
/* ------------------------------------------------------------------ */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAccessTokenExpired =
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED";

    /* ─────────────── Scenario 1: Access Token Expired, Attempt Refresh ─────────────── */
    // Check if the access token has expired AND if this request hasn't been retried yet.
    if (isAccessTokenExpired && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retried to prevent infinite loops

      if (isRefreshing) {
        // If a token refresh is already in progress, queue the original request.
        // It will be replayed once the new token is available.
        return new Promise((resolve, reject) => {
          refreshSubscribers.push({ resolve, reject }); // Store resolve/reject for later
        })
          .then((newToken) => {
            // Replay with the new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => {
            // Propagate error if the main refresh operation failed
            return Promise.reject(err);
          });
      }

      isRefreshing = true; // Indicate that a refresh process has started

      try {
        if (!currentRefreshToken) {
          // If no refresh token is available, we cannot refresh. Force logout.
          throw new Error("No refresh token available. Forcing logout.");
        }

        /* Hit our refresh endpoint to get new tokens */
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/auth/refresh`,
          { refreshToken: currentRefreshToken }
        );

        const { token: newAccess, refreshToken: newRefresh } = data;

        /* ─── 1) Update Redux State ─── */
        store.dispatch(setReduxToken(newAccess));
        store.dispatch(setReduxRefreshToken(newRefresh));

        /* ─── 2) Update LocalStorage + Axios Defaults (for new requests) ─── */
        setAuthToken(newAccess); // Sets axios.defaults.headers.common.Authorization and localStorage
        persistRefreshToken(newRefresh); // Sets localStorage for refresh token

        /* ─── 3) Update in-memory variables used by interceptor ─── */
        currentToken = newAccess;
        currentRefreshToken = newRefresh;

        /* Release all queued requests with the new access token */
        processQueue(null, newAccess);

        /* Replay the original failed request with the new access token */
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshErr) {
        console.error("🔒 Refresh failed → Forcing logout:", refreshErr);
        // If the refresh itself fails (e.g., refresh token expired/invalid),
        // clear tokens, dispatch logout, and redirect to login.
        clearTokens();
        store.dispatch(logout());
        window.location.href = "/login"; // Force redirect to login page
        processQueue(refreshErr); // Reject any queued requests with the refresh error
        return Promise.reject(refreshErr); // Propagate the refresh error
      } finally {
        isRefreshing = false; // Reset refreshing flag
      }
    }

    /* ─────────────── Scenario 2: Any Other 401 Error ─────────────── */
    // This block handles 401s that are *not* due to `TOKEN_EXPIRED` (e.g., invalid token signature,
    // or if a token was invalid on retry, etc.). It also serves as a fallback.
    if (error.response?.status === 401) {
      console.warn("Invalid token detected (not just expired). Forcing logout.");
      clearTokens();
      store.dispatch(logout());
      window.location.href = "/login"; // Force redirect for explicit logout
      return Promise.reject(error); // Propagate the original error
    }

    /* ─────────────── Scenario 3: Any Non-401 Error ─────────────── */
    // For any other non-401 error, or 401s that didn't trigger specific handling above,
    // simply reject the promise and propagate the error.
    return Promise.reject(error);
  }
);

export default api;