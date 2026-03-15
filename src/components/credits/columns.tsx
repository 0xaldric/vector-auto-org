"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { CreditTransactionResponseDto } from "@/generated/types.gen";

const typeVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  admin_add: "default",
  deposit: "default",
  refund: "secondary",
  discount: "secondary",
  deduction: "destructive",
};

const typeLabel: Record<string, string> = {
  admin_add: "Admin Add",
  deposit: "Deposit",
  refund: "Refund",
  discount: "Discount",
  deduction: "Deduction",
};

export const creditColumns: ColumnDef<CreditTransactionResponseDto>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <Badge variant={typeVariant[type] ?? "outline"}>
          {typeLabel[type] ?? type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.original.amount;
      return (
        <span className={`font-mono font-medium ${amount >= 0 ? "text-emerald-600" : "text-destructive"}`}>
          {amount >= 0 ? "+" : ""}{amount.toLocaleString()}
        </span>
      );
    },
  },
  {
    accessorKey: "balanceBefore",
    header: "Before",
    cell: ({ row }) => (
      <span className="font-mono text-muted-foreground">
        {row.original.balanceBefore.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "balanceAfter",
    header: "After",
    cell: ({ row }) => (
      <span className="font-mono">
        {row.original.balanceAfter.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "performedBy",
    header: "Performed By",
    cell: ({ row }) => {
      const by = row.original.performedBy;
      return (
        <span className="text-sm text-muted-foreground">
          {by === "system" ? "System" : by}
        </span>
      );
    },
  },
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.note || "—"}
      </span>
    ),
  },
  {
    accessorKey: "referenceType",
    header: "Ref",
    cell: ({ row }) => {
      const refType = row.original.referenceType;
      if (!refType) return <span className="text-muted-foreground">—</span>;
      return <Badge variant="outline" className="capitalize">{refType}</Badge>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.original.created_at).toLocaleString("vi-VN"),
  },
];
