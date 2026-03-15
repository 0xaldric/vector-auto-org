"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  merchantControllerListTiersOptions,
  merchantControllerReplaceTiersMutation,
  merchantControllerListTiersQueryKey,
} from "@/generated/@tanstack/react-query.gen";
import { Plus, Trash2, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Tier = {
  minOrders: number;
  maxOrders?: number | null;
  commissionAmount: number;
};

export function CommissionTiers() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(merchantControllerListTiersOptions());
  const [tiers, setTiers] = useState<Tier[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serverTiers = (data as any)?.data ?? (data as any) ?? [];

  useEffect(() => {
    if (Array.isArray(serverTiers) && serverTiers.length > 0) {
      setTiers(serverTiers.map((t: Tier) => ({
        minOrders: t.minOrders,
        maxOrders: t.maxOrders ?? undefined,
        commissionAmount: t.commissionAmount,
      })));
    }
  }, [serverTiers.length]);

  const { mutate, isPending } = useMutation({
    ...merchantControllerReplaceTiersMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: merchantControllerListTiersQueryKey() });
    },
  });

  const addTier = () => {
    const lastMax = tiers.length > 0 ? (tiers[tiers.length - 1].maxOrders ?? 0) + 1 : 0;
    setTiers([...tiers, { minOrders: lastMax, commissionAmount: 0 }]);
  };

  const removeTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, field: keyof Tier, value: string) => {
    const updated = [...tiers];
    const num = parseInt(value, 10);
    if (field === "maxOrders" && value === "") {
      updated[index] = { ...updated[index], maxOrders: undefined };
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (updated[index] as any)[field] = isNaN(num) ? 0 : num;
    }
    setTiers(updated);
  };

  const handleSave = () => {
    mutate({
      body: {
        tiers: tiers.map((t) => ({
          minOrders: t.minOrders,
          maxOrders: t.maxOrders ?? undefined,
          commissionAmount: t.commissionAmount,
        })),
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Commission Tiers</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={addTier}>
            <Plus className="mr-1 h-4 w-4" />
            Add Tier
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            <Save className="mr-1 h-4 w-4" />
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {tiers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tiers configured yet.</p>
        ) : (
          <div className="space-y-3">
            {tiers.map((tier, i) => (
              <div key={i} className="flex items-end gap-3 rounded-md border p-3">
                <div className="flex-1">
                  <Label className="text-xs">Min Orders</Label>
                  <Input
                    type="number"
                    min={0}
                    value={tier.minOrders}
                    onChange={(e) => updateTier(i, "minOrders", e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Max Orders (empty = unlimited)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={tier.maxOrders ?? ""}
                    placeholder="Unlimited"
                    onChange={(e) => updateTier(i, "maxOrders", e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-xs">Commission (VND)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={tier.commissionAmount}
                    onChange={(e) => updateTier(i, "commissionAmount", e.target.value)}
                  />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => removeTier(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
