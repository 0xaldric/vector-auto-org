"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PaymentTx } from "@/lib/payment-api";

export const paymentColumns: ColumnDef<PaymentTx>[] = [
  {
    accessorKey: "transferAmount",
    header: "Amount (VND)",
    cell: ({ row }) =>
      new Intl.NumberFormat("vi-VN").format(row.original.transferAmount) + " ₫",
  },
  {
    accessorKey: "creditsAdded",
    header: "Credits Added",
    cell: ({ row }) => (
      <span className="font-mono font-medium text-primary">
        +{row.original.creditsAdded.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "content",
    header: "Content / Code",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.content || "—"}
      </span>
    ),
  },
  {
    accessorKey: "transactionDate",
    header: "Date",
    cell: ({ row }) => {
      const date = row.original.transactionDate || row.original.created_at;
      return new Date(date).toLocaleString("vi-VN");
    },
  },
];
