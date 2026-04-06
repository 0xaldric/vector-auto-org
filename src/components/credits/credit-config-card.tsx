"use client";

import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  verificationControllerUpdateCreditConfigMutation,
  verificationControllerGetCreditConfigsQueryKey,
} from "@/generated/@tanstack/react-query.gen";
import type { CreditConfigResponseDto, PricingTierResponseDto } from "@/generated/types.gen";

const keyLabel: Record<string, string> = {
  verification_ai: "AI Verification",
  verification_spss: "SPSS Verification",
  verification_ai_download: "Tải Excel chỉnh sửa AI",
  order_submission: "Order Submissions",
};

// ─── Flat config card ─────────────────────────────────────────────────────────

function FlatConfigCard({ config }: { config: CreditConfigResponseDto }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(config.amount ?? 0));
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    ...verificationControllerUpdateCreditConfigMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationControllerGetCreditConfigsQueryKey() });
      setOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(amount, 10);
    if (isNaN(parsed) || parsed < 0) return;
    mutate({ path: { key: config.key }, body: { amount: parsed } });
  };

  return (
    <>
      <Card>
        <CardContent className="flex items-center justify-between gap-4 p-6">
          <div className="min-w-0 flex-1">
            <p className="font-medium">{keyLabel[config.key] ?? config.key}</p>
            <p className="text-sm text-muted-foreground">{config.description || config.key}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xl font-bold">
              {(config.amount ?? 0).toLocaleString("vi-VN")}
            </p>
            <p className="text-xs text-muted-foreground">credits</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => { setAmount(String(config.amount ?? 0)); setOpen(true); }}>
            <Pencil className="mr-1 h-3.5 w-3.5" />
            Edit
          </Button>
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Update Credit Price</SheetTitle>
            <SheetDescription>
              Set the credit cost for{" "}
              <span className="font-medium">{keyLabel[config.key] ?? config.key}</span>.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Credit Amount</Label>
              <Input
                id="amount"
                type="number"
                min={0}
                step={1000}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Current: {(config.amount ?? 0).toLocaleString("vi-VN")} credits
              </p>
            </div>
            <SheetFooter>
              <Button type="submit" disabled={isPending || amount === ""}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

// ─── Tiered config card ───────────────────────────────────────────────────────

function TieredConfigCard({ config }: { config: CreditConfigResponseDto }) {
  const [open, setOpen] = useState(false);
  const [tiers, setTiers] = useState<PricingTierResponseDto[]>(config.tiers ?? []);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    ...verificationControllerUpdateCreditConfigMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationControllerGetCreditConfigsQueryKey() });
      setOpen(false);
    },
  });

  const handleOpen = () => {
    setTiers(config.tiers ? [...config.tiers] : []);
    setOpen(true);
  };

  const handleTierChange = (idx: number, field: keyof PricingTierResponseDto, value: string) => {
    setTiers((prev) =>
      prev.map((t, i) => (i === idx ? { ...t, [field]: parseInt(value, 10) || 0 } : t))
    );
  };

  const handleAddTier = () => {
    const last = tiers[tiers.length - 1];
    setTiers([...tiers, { maxSubmissions: (last?.maxSubmissions ?? 0) + 500, amount: 0 }]);
  };

  const handleRemoveTier = (idx: number) => {
    setTiers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tiers.length === 0) return;
    mutate({ path: { key: config.key }, body: { tiers } });
  };

  const sorted = [...(config.tiers ?? [])].sort((a, b) => a.maxSubmissions - b.maxSubmissions);

  return (
    <>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">{keyLabel[config.key] ?? config.key}</p>
              <p className="text-sm text-muted-foreground">{config.description || config.key}</p>
            </div>
            <Button size="sm" variant="outline" onClick={handleOpen}>
              <Pencil className="mr-1 h-3.5 w-3.5" />
              Edit Tiers
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Max Submissions</TableHead>
                <TableHead className="text-right">Credits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((tier, i) => (
                <TableRow key={i}>
                  <TableCell className="text-muted-foreground">
                    {i === 0 ? `1 – ${tier.maxSubmissions}` : `${sorted[i - 1].maxSubmissions + 1} – ${tier.maxSubmissions}`}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {tier.amount.toLocaleString("vi-VN")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Submission Tiers</SheetTitle>
            <SheetDescription>
              Each tier applies when submissions ≤ maxSubmissions. Sorted ascending automatically.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
            <div className="space-y-2">
              {tiers.map((tier, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1 block">Max Submissions</Label>
                    <Input
                      type="number"
                      min={1}
                      value={tier.maxSubmissions}
                      onChange={(e) => handleTierChange(idx, "maxSubmissions", e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1 block">Credits</Label>
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      value={tier.amount}
                      onChange={(e) => handleTierChange(idx, "amount", e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="mt-5 shrink-0 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveTier(idx)}
                    disabled={tiers.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddTier}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Tier
            </Button>
            <SheetFooter>
              <Button type="submit" disabled={isPending || tiers.length === 0}>
                {isPending ? "Saving..." : "Save Tiers"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function CreditConfigCard({ config }: { config: CreditConfigResponseDto }) {
  if (config.tiers && config.tiers.length > 0) {
    return <TieredConfigCard config={config} />;
  }
  return <FlatConfigCard config={config} />;
}
