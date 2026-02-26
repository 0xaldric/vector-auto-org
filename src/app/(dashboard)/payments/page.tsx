"use client";

import { Header } from "@/components/layout/header";
import { DataTable } from "@/components/users/data-table";
import { paymentColumns } from "@/components/payments/columns";
import { usePaymentTransactions } from "@/hooks/use-payments";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, TrendingUp, Coins } from "lucide-react";

export default function PaymentsPage() {
  const { data, isLoading, isError } = usePaymentTransactions();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = data as any;
  const transactions = response?.data ?? [];

  const totalRevenue = transactions.reduce(
    (sum: number, tx: { transferAmount: number }) => sum + tx.transferAmount,
    0
  );
  const totalCredits = transactions.reduce(
    (sum: number, tx: { creditsAdded: number }) => sum + tx.creditsAdded,
    0
  );

  return (
    <>
      <Header title="Payments" />
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">
            All payment transactions across the platform.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat("vi-VN").format(totalRevenue)} ₫
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <Coins className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credits Issued</p>
                <p className="text-2xl font-bold">
                  {totalCredits.toLocaleString()}
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
        ) : isError ? (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-6 py-8 text-center text-sm text-destructive">
            Failed to load transactions. Make sure the backend is running and restarted with the latest code.
          </div>
        ) : (
          <DataTable
            columns={paymentColumns}
            data={transactions}
            page={1}
            totalPages={1}
            onPageChange={() => {}}
          />
        )}
      </div>
    </>
  );
}
