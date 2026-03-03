import Axios, { AxiosRequestConfig } from "axios";
import { getSession, signOut } from "next-auth/react";

const axios = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axios.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await signOut({ callbackUrl: "/login" });
    }
    return Promise.reject(error);
  },
);

export const apiClient = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = axios({
    ...config,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error - adding cancel method to promise
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};

export default axios;
