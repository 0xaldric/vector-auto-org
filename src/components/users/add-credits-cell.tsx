"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Coins } from "lucide-react";
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
import { useMutation } from "@tanstack/react-query";
import { usersControllerAddCreditsMutation } from "@/generated/@tanstack/react-query.gen";

interface AddCreditsCellProps {
  userId: string;
  userName?: string;
}

export function AddCreditsCell({ userId, userName }: AddCreditsCellProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    ...usersControllerAddCreditsMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/users"] });
      setOpen(false);
      setAmount("");
      setNote("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(amount, 10);
    if (!parsed || parsed < 1) return;
    mutate({ path: { id: userId }, body: { amount: parsed, type: "refund", note: note || undefined } });
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Coins className="mr-1 h-3.5 w-3.5" />
        Add Credits
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add Credits</SheetTitle>
            <SheetDescription>
              Add credits to {userName || userId}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min={1}
                placeholder="e.g. 100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="note">Note (optional)</Label>
              <Input
                id="note"
                placeholder="Reason or note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <SheetFooter>
              <Button type="submit" disabled={isPending || !amount}>
                {isPending ? "Adding..." : "Add Credits"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
