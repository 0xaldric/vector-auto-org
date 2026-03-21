"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { DataTable } from "@/components/users/data-table";
import { orderColumns } from "@/components/forms/order-columns";
import { useQuery } from "@tanstack/react-query";
import { googleFormControllerAdminListOrdersOptions } from "@/generated/@tanstack/react-query.gen";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, PlayCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type OrderStatus = 'pending' | 'running' | 'idle' | 'paused' | 'completed' | 'cancelled' | 'failed';

export default function FormsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
  const limit = 10;

  const { data, isLoading } = useQuery(
    googleFormControllerAdminListOrdersOptions({
      query: {
        page,
        limit,
        ...(status ? { status } : {}),
      },
    })
  );

  function handleStatusChange(val: string) {
    setPage(1);
    setStatus(val === "all" ? undefined : (val as OrderStatus));
  }

  const orders = data?.data?.data ?? [];
  const totalPages = data?.data?.meta?.totalPages ?? 1;
  const totalItems = data?.data?.meta?.totalItems ?? 0;

  const completedCount = orders.filter(
    (o) => o.status === "completed"
  ).length;
  const runningCount = orders.filter(
    (o) => o.status === "running"
  ).length;

  return (
    <>
      <Header title="Forms & Orders" />
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Form Orders</h2>
            <p className="text-muted-foreground">
              All form submission orders across the platform.
            </p>
          </div>
          <Select value={status ?? "all"} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="idle">Idle</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed (page)</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                <PlayCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Running (page)</p>
                <p className="text-2xl font-bold">{runningCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <DataTable
            columns={orderColumns}
            data={orders}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </>
  );
}
