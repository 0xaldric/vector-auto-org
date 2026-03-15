"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  merchantControllerUpdateMerchantStatusMutation,
  merchantControllerListMerchantsQueryKey,
} from "@/generated/@tanstack/react-query.gen";

type Merchant = {
  _id: string;
  userId:
    | string
    | { _id: string; email: string; displayName?: string };
  referralCode: string;
  isActive: boolean;
  totalEarnings: number;
  currentBalance: number;
  totalWithdrawn: number;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  created_at: string;
};

function ToggleStatusCell({ merchant }: { merchant: Merchant }) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    ...merchantControllerUpdateMerchantStatusMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: merchantControllerListMerchantsQueryKey() });
    },
  });

  return (
    <Button
      size="sm"
      variant={merchant.isActive ? "destructive" : "default"}
      disabled={isPending}
      onClick={() =>
        mutate({
          path: { id: merchant._id },
          body: { isActive: !merchant.isActive },
        })
      }
    >
      {merchant.isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}

export const merchantColumns: ColumnDef<Merchant>[] = [
  {
    id: "user",
    header: "User",
    cell: ({ row }) => {
      const u = row.original.userId;
      if (typeof u === "object" && u !== null) {
        return (
          <div>
            <p className="font-medium">{u.displayName || u.email}</p>
            <p className="text-xs text-muted-foreground">{u.email}</p>
          </div>
        );
      }
      return <span className="font-mono text-xs">{u}</span>;
    },
  },
  {
    accessorKey: "referralCode",
    header: "Referral Code",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.referralCode}</span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "destructive"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    accessorKey: "totalEarnings",
    header: "Total Earnings",
    cell: ({ row }) => (
      <span className="font-mono">
        {new Intl.NumberFormat("vi-VN").format(row.original.totalEarnings)} ₫
      </span>
    ),
  },
  {
    accessorKey: "currentBalance",
    header: "Balance",
    cell: ({ row }) => (
      <span className="font-mono font-medium">
        {new Intl.NumberFormat("vi-VN").format(row.original.currentBalance)} ₫
      </span>
    ),
  },
  {
    accessorKey: "totalWithdrawn",
    header: "Withdrawn",
    cell: ({ row }) => (
      <span className="font-mono text-muted-foreground">
        {new Intl.NumberFormat("vi-VN").format(row.original.totalWithdrawn)} ₫
      </span>
    ),
  },
  {
    id: "bank",
    header: "Bank Info",
    cell: ({ row }) => {
      const m = row.original;
      if (!m.bankName) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="text-xs">
          <p>{m.bankName}</p>
          <p className="font-mono">{m.accountNumber}</p>
          <p className="text-muted-foreground">{m.accountHolder}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) =>
      new Date(row.original.created_at).toLocaleDateString("vi-VN"),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <ToggleStatusCell merchant={row.original} />,
  },
];
