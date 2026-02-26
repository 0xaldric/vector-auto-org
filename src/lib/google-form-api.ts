import { apiClient } from "./api-client";

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  status: string;
  code: number;
  data: T;
}

export interface PaginatedPayload<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormField {
  entryId: string;
  label: string;
  type: string;
  required: boolean;
  options: FormFieldOption[];
}

export interface GoogleForm {
  _id: string;
  formId: string;
  url: string;
  title: string;
  description: string;
  fields: FormField[];
  pageCount: number;
  createdBy: string;
  created_at: string;
  updated_at: string;
}

export interface FormOrder {
  _id: string;
  formId: string;
  userId: string;
  mode: "random" | "rates" | "sheet";
  status: "pending" | "running" | "completed" | "cancelled" | "failed";
  totalSubmissions: number;
  completedSubmissions: number;
  creditCost: number;
  created_at: string;
  updated_at: string;
  form?: { title: string; url?: string; formId?: string } | null;
}

export interface Submission {
  _id: string;
  orderId: string;
  status: "success" | "failed";
  error?: string;
  created_at: string;
}

export interface OrderWithSubmissions extends FormOrder {
  submissions: Submission[];
}

export const listForms = (params?: PaginationQuery) =>
  apiClient<ApiResponse<PaginatedPayload<GoogleForm>>>({
    url: "/google-form/admin/forms",
    method: "GET",
    params,
  });

export const listOrders = (params?: PaginationQuery) =>
  apiClient<ApiResponse<PaginatedPayload<FormOrder>>>({
    url: "/google-form/admin/orders",
    method: "GET",
    params,
  });

export const getOrder = (id: string) =>
  apiClient<ApiResponse<OrderWithSubmissions>>({
    url: `/google-form/order/${id}`,
    method: "GET",
  });
