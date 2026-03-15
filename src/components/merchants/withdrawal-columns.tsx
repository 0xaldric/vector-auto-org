"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  merchantControllerReviewWithdrawalMutation,
  merchantControllerCompleteWithdrawalMutation,
  merchantControllerListAllWithdrawalsQueryKey,
} from "@/generated/@tanstack/react-query.gen";

type Withdrawal = {
  _id: string;
  merchantId:
    | string
    | { _id: string; userId?: string | { email?: string; displayName?: string } };
  amount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  reviewNote?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  created_at: string;
};

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "outline",
  approved: "secondary",
  rejected: "destructive",
  completed: "default",
};

function WithdrawalActions({ withdrawal }: { withdrawal: Withdrawal }) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: merchantControllerListAllWithdrawalsQueryKey({
        query: { status: "" },
      }),
    });
  };

  const { mutate: review, isPending: isReviewing } = useMutation({
    ...merchantControllerReviewWithdrawalMutation(),
    onSuccess: invalidate,
  });

  const { mutate: complete, isPending: isCompleting } = useMutation({
    ...merchantControllerCompleteWithdrawalMutation(),
    onSuccess: invalidate,
  });

  if (withdrawal.status === "pending") {
    return (
      <div className="flex gap-1">
        <Button
          size="sm"
          disabled={isReviewing}
          onClick={() =>
            review({
              path: { id: withdrawal._id },
              body: { action: "approved" },
            })
          }
        >
          Approve
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={isReviewing}
          onClick={() =>
            review({
              path: { id: withdrawal._id },
              body: { action: "rejected" },
            })
          }
        >
          Reject
        </Button>
      </div>
    );
  }

  if (withdrawal.status === "approved") {
    return (
      <Button
        size="sm"
        disabled={isCompleting}
        onClick={() => complete({ path: { id: withdrawal._id } })}
      >
        Mark Completed
      </Button>
    );
  }

  return null;
}

export const withdrawalColumns: ColumnDef<Withdrawal>[] = [
  {
    id: "merchant",
    header: "Merchant",
    cell: ({ row }) => {
      const m = row.original.merchantId;
      if (typeof m === "object" && m !== null) {
        const u = m.userId;
        if (typeof u === "object" && u !== null) {
          return (
            <span className="text-sm">{u.displayName || u.email || m._id}</span>
          );
        }
        return <span className="font-mono text-xs">{String(u || m._id)}</span>;
      }
      return <span className="font-mono text-xs">{m}</span>;
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-mono font-medium">
        {new Intl.NumberFormat("vi-VN").format(row.original.amount)} ₫
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status] ?? "outline"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "bank",
    header: "Bank Info",
    cell: ({ row }) => {
      const w = row.original;
      if (!w.bankName) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="text-xs">
          <p>{w.bankName}</p>
          <p className="font-mono">{w.accountNumber}</p>
          <p className="text-muted-foreground">{w.accountHolder}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "reviewNote",
    header: "Note",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.reviewNote || "—"}
      </span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) =>
      new Date(row.original.created_at).toLocaleString("vi-VN"),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <WithdrawalActions withdrawal={row.original} />,
  },
];
