"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  merchantControllerUpdateMerchantStatusMutation,
  merchantControllerListMerchantsQueryKey,
} from "@/generated/@tanstack/react-query.gen";
import type { MerchantProfileWithUserResponseDto } from "@/generated/types.gen";

type Merchant = MerchantProfileWithUserResponseDto;

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
      return (
        <div>
          <p className="font-medium">{u.displayName || u.email}</p>
          <p className="text-xs text-muted-foreground">{u.email}</p>
        </div>
      );
    },
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
    accessorKey: "totalEarned",
    header: "Total Earnings",
    cell: ({ row }) => (
      <span className="font-mono">
        {new Intl.NumberFormat("vi-VN").format(row.original.totalEarned)} ₫
      </span>
    ),
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => (
      <span className="font-mono font-medium">
        {new Intl.NumberFormat("vi-VN").format(row.original.balance)} ₫
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
      const bank = row.original.bankInfo;
      if (!bank) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="text-xs">
          <p>{bank.bankName}</p>
          <p className="font-mono">{bank.accountNumber}</p>
          <p className="text-muted-foreground">{bank.accountHolder}</p>
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
