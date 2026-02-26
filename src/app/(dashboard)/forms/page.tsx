"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { DataTable } from "@/components/users/data-table";
import { orderColumns } from "@/components/forms/order-columns";
import { useOrders } from "@/hooks/use-forms";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, PlayCircle } from "lucide-react";

export default function FormsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading } = useOrders({ page, limit });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = data as any;
  const orders = response?.data?.data ?? [];
  const totalPages = response?.data?.meta?.totalPages ?? 1;
  const totalItems = response?.data?.meta?.totalItems ?? 0;

  const completedCount = orders.filter(
    (o: { status: string }) => o.status === "completed"
  ).length;
  const runningCount = orders.filter(
    (o: { status: string }) => o.status === "running"
  ).length;

  return (
    <>
      <Header title="Forms & Orders" />
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Form Orders</h2>
          <p className="text-muted-foreground">
            All form submission orders across the platform.
          </p>
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
