import axios from "axios";
import { store } from "./store";
import {
  setToken as setReduxToken,
  setRefreshToken as setReduxRefreshToken,
  logout,
} from "./redux/slices/authSlice";
import {
  setAuthToken,          // ⇒ writes access-token to localStorage + axios.defaults
  setRefreshToken as persistRefreshToken, // ⇒ writes refresh-token to localStorage
  clearTokens,
} from "./utils/setAuthToken";

/* ------------------------------------------------------------------ */
/* 1. AXIOS INSTANCE                                                   */
/* ------------------------------------------------------------------ */
const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api/v1",
});

/* ------------------------------------------------------------------ */
/* 2. IN-MEMORY SHADOW COPIES                                         */
/* ------------------------------------------------------------------ */
let currentToken         = store.getState().auth.token;
let currentRefreshToken  = store.getState().auth.refreshToken;
let isRefreshing         = false;
let refreshSubscribers   = [];

/* keep the shadow copies in-sync with Redux on every update */
store.subscribe(() => {
  const { token, refreshToken } = store.getState().auth;
  currentToken        = token;
  currentRefreshToken = refreshToken;
});

/* ------------------------------------------------------------------ */
/* 3. REQUEST INTERCEPTOR – add Bearer                                */
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
/* 4. RESPONSE INTERCEPTOR – refresh logic                            */
/* ------------------------------------------------------------------ */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const tokenExpired =
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED";

    /* ─────────────── TRY REFRESH ONCE ─────────────── */
    if (tokenExpired && !originalRequest._retry) {
      originalRequest._retry = true;

      /* queue every request that hits while we’re refreshing */
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((newAccess) => {
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        if (!currentRefreshToken) throw new Error("No refresh token");

        /* hit our refresh endpoint */
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/auth/refresh`,
          { refreshToken: currentRefreshToken }
        );

        const { token: newAccess, refreshToken: newRefresh } = data;

        /* ─── 1) update Redux  ─── */
        store.dispatch(setReduxToken(newAccess));
        store.dispatch(setReduxRefreshToken(newRefresh));

        /* ─── 2) update LocalStorage + axios.defaults  ─── */
        setAuthToken(newAccess);
        persistRefreshToken(newRefresh);

        /* ─── 3) update memory vars used by interceptor  ─── */
        currentToken        = newAccess;
        currentRefreshToken = newRefresh;

        /* release queued requests */
        refreshSubscribers.forEach((cb) => cb(newAccess));
        refreshSubscribers = [];

        /* replay the failed request */
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshErr) {
        console.error("🔒  Refresh failed → forcing logout");
        clearTokens();
        store.dispatch(logout());
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    /* plain 401 (invalid token etc.) */
    if (error.response?.status === 401) {
      clearTokens();
      store.dispatch(logout());
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
