import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_MAX_AGE,
  createCookieOptions,
  REFRESH_TOKEN_MAX_AGE,
} from "./cookie-options";

const axiosInstance = axios.create({
  baseURL: `${process.env.BACKEND_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = (await cookies()).get("refreshToken")?.value;
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(
          `${process.env.BACKEND_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        (await cookies()).set("accessToken", data.token, {
          ...createCookieOptions(ACCESS_TOKEN_MAX_AGE),
        });

        (await cookies()).set("refreshToken", data.newRefreshToken, {
          ...createCookieOptions(REFRESH_TOKEN_MAX_AGE),
        });

        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return axiosInstance(originalRequest);
      } catch {
        (await cookies()).delete("accessToken");
        (await cookies()).delete("refreshToken");

        return NextResponse.json(
          { error: "SESSION_EXPIRED" },
          { status: 401, headers: { "X-Auth-Redirect": "/login" } }
        );
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
