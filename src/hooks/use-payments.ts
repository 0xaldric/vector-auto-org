"use client";
import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/lib/payment-api";

export function usePaymentTransactions() {
  return useQuery({
    queryKey: ["payment", "transactions"],
    queryFn: getTransactions,
  });
}
