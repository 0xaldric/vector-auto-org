import { client } from "@/generated/client.gen";
import { getSession, signOut } from "next-auth/react";

client.setConfig({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

client.instance.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

client.instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await signOut({ callbackUrl: "/login" });
    }
    return Promise.reject(error);
  },
);

export default client;
