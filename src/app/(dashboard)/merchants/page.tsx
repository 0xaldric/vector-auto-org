"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { DataTable } from "@/components/users/data-table";
import { merchantColumns } from "@/components/merchants/merchant-columns";
import { withdrawalColumns } from "@/components/merchants/withdrawal-columns";
import { CreateMerchantDialog } from "@/components/merchants/create-merchant-dialog";
import { CommissionTiers } from "@/components/merchants/commission-tiers";
import {
  merchantControllerListMerchantsOptions,
  merchantControllerListAllWithdrawalsOptions,
} from "@/generated/@tanstack/react-query.gen";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function MerchantsTab() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading } = useQuery(
    merchantControllerListMerchantsOptions({ query: { page, limit } })
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = data as any;
  const merchants = response?.data?.data ?? response?.data ?? [];
  const totalPages = response?.data?.meta?.totalPages ?? response?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Manage merchant accounts and their status.
        </p>
        <CreateMerchantDialog />
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <DataTable
          columns={merchantColumns}
          data={merchants}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

function WithdrawalsTab() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("pending");
  const limit = 10;
  const { data, isLoading } = useQuery(
    merchantControllerListAllWithdrawalsOptions({
      query: { page, limit, status },
    })
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = data as any;
  const withdrawals = response?.data?.data ?? response?.data ?? [];
  const totalPages = response?.data?.meta?.totalPages ?? response?.meta?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Review and manage withdrawal requests.
        </p>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <DataTable
          columns={withdrawalColumns}
          data={withdrawals}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

export default function MerchantsPage() {
  return (
    <>
      <Header title="Merchants" />
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Merchant Management</h2>
          <p className="text-muted-foreground">
            Manage merchants, withdrawals, and commission tiers.
          </p>
        </div>

        <Tabs defaultValue="merchants">
          <TabsList>
            <TabsTrigger value="merchants">Merchants</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="tiers">Commission Tiers</TabsTrigger>
          </TabsList>
          <TabsContent value="merchants" className="mt-4">
            <MerchantsTab />
          </TabsContent>
          <TabsContent value="withdrawals" className="mt-4">
            <WithdrawalsTab />
          </TabsContent>
          <TabsContent value="tiers" className="mt-4">
            <CommissionTiers />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
