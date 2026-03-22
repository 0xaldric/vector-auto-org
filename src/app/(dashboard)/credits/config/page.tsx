"use client";

import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { CreditConfigCard } from "@/components/credits/credit-config-card";
import { verificationControllerGetCreditConfigsOptions } from "@/generated/@tanstack/react-query.gen";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings2 } from "lucide-react";

export default function CreditConfigPage() {
  const { data, isLoading } = useQuery(
    verificationControllerGetCreditConfigsOptions()
  );

  const configs = data?.data ?? [];

  return (
    <>
      <Header title="Credit Pricing" />
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Credit Pricing</h2>
          <p className="text-muted-foreground">
            Configure how many credits each verification type costs. Changes apply immediately.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
          <Settings2 className="h-4 w-4 shrink-0" />
          Prices are stored in the database and cached in Redis. Editing a price updates both instantly.
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </>
          ) : configs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No credit config found.</p>
          ) : (
            configs.map((config) => (
              <CreditConfigCard key={config.key} config={config} />
            ))
          )}
        </div>
      </div>
    </>
  );
}
