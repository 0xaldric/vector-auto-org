"use client";
import { useQuery } from "@tanstack/react-query";
import { listForms, listOrders, getOrder, PaginationQuery } from "@/lib/google-form-api";

export function useForms(params?: PaginationQuery) {
  return useQuery({
    queryKey: ["forms", params],
    queryFn: () => listForms(params),
  });
}

export function useOrders(params?: PaginationQuery) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => listOrders(params),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrder(id),
    enabled: !!id,
  });
}
