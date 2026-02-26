"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { FormOrder } from "@/lib/google-form-api";

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  completed: "default",
  running: "secondary",
  pending: "outline",
  cancelled: "destructive",
  failed: "destructive",
};

const statusLabel: Record<string, string> = {
  completed: "Completed",
  running: "Running",
  pending: "Pending",
  cancelled: "Cancelled",
  failed: "Failed",
};

export const orderColumns: ColumnDef<FormOrder>[] = [
  {
    id: "form",
    header: "Form",
    cell: ({ row }) => {
      // After populate, formId is the populated object {_id, formId, url, title}
      const populated = row.original.formId as unknown as { title?: string; formId?: string } | string;
      const title =
        row.original.form?.title ??
        (typeof populated === "object" && populated !== null
          ? populated.title
          : populated);
      return <span className="font-medium">{title ?? "—"}</span>;
    },
  },
  {
    accessorKey: "mode",
    header: "Mode",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.mode}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={statusVariant[status] ?? "outline"}>
          {statusLabel[status] ?? status}
        </Badge>
      );
    },
  },
  {
    id: "progress",
    header: "Progress",
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.original.completedSubmissions} / {row.original.totalSubmissions}
      </span>
    ),
  },
  {
    accessorKey: "creditCost",
    header: "Credits",
    cell: ({ row }) => row.original.creditCost.toLocaleString(),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) =>
      new Date(row.original.created_at).toLocaleDateString("vi-VN"),
  },
];
