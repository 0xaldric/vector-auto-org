"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { DataTable } from "@/components/users/data-table";
import { creditColumns } from "@/components/credits/columns";
import { usersControllerGetMyCreditHistoryOptions } from "@/generated/@tanstack/react-query.gen";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, TrendingUp, TrendingDown } from "lucide-react";

export default function CreditsPage() {
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => setMounted(true), []);

  const { data, isLoading } = useQuery(
    usersControllerGetMyCreditHistoryOptions({ query: { page, limit } })
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = data as any;
  const paginated = response?.data;
  const transactions = paginated?.data ?? [];
  const meta = paginated?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const totalAdded = transactions
    .filter((t: { amount: number }) => t.amount > 0)
    .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);
  const totalDeducted = transactions
    .filter((t: { amount: number }) => t.amount < 0)
    .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);

  return (
    <>
      <Header title="Credit History" />
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Credit History</h2>
          <p className="text-muted-foreground">
            View all credit transactions on your account.
          </p>
        </div>

        {!mounted ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Coins className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="text-2xl font-bold">{meta?.totalItems ?? transactions.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Added (page)</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      +{new Intl.NumberFormat("vi-VN").format(totalAdded)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Deducted (page)</p>
                    <p className="text-2xl font-bold text-red-600">
                      {new Intl.NumberFormat("vi-VN").format(totalDeducted)}
                    </p>
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
                columns={creditColumns}
                data={transactions}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
