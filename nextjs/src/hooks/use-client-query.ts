import clientAxios from "@/utils/client-http";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

type UseClientQueryProps<T> = {
  keys: string[];
  url: string;
  options?: Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn">;
};

export const useClientQuery = <T>({
  keys,
  url,
  options,
}: UseClientQueryProps<T>) => {
  return useQuery({
    queryKey: keys,
    queryFn: () => fetcher<T>(url),
    ...options,
  });
};

type ErrorWithStatus = Error & { status?: number };
type AxiosError = {
  response?: { status?: number; data?: { message?: string } };
};

export const fetcher = async <T>(url: string): Promise<T> => {
  try {
    const response = await clientAxios.get<T>(url);
    return response.data;
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "status" in error.response
    ) {
      const status = (error.response as AxiosError["response"])?.status;
      const fetchError = new Error(
        `${status}: ${
          status === 401 ? "Authentication required" : "Request failed"
        }`
      ) as ErrorWithStatus;
      fetchError.status = status;
      throw fetchError;
    }
    throw error;
  }
};
