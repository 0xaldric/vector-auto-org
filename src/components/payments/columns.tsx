"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { PaymentTransactionResponseDto } from "@/generated/types.gen";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type PaymentTx = PaymentTransactionResponseDto & {
  userEmail?: string;
  userName?: string;
  userAvatar?: string;
};

export const paymentColumns: ColumnDef<PaymentTx>[] = [
  {
    id: "user",
    header: "User",
    cell: ({ row }) => {
      const tx = row.original;
      const initials = tx.userName
        ? tx.userName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "?";
      return (
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            {tx.userAvatar && <AvatarImage src={tx.userAvatar} alt={tx.userName || "User"} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{tx.userName || "—"}</p>
            <p className="text-xs text-muted-foreground truncate">
              {tx.userEmail || "—"}
            </p>
          </div>
        </div>
      );
    },
  },
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
