import { apiClient } from "./api-client";

export interface ApiResponse<T> {
  status: string;
  code: number;
  data: T;
}

export interface PaymentTx {
  _id: string;
  transferAmount: number;
  creditsAdded: number;
  content: string;
  transactionDate: string;
  created_at: string;
}

export const getTransactions = () =>
  apiClient<ApiResponse<PaymentTx[]>>({
    url: "/payment/admin/transactions",
    method: "GET",
  });
