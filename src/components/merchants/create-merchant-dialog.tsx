"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  merchantControllerCreateMerchantMutation,
  merchantControllerListMerchantsQueryKey,
} from "@/generated/@tanstack/react-query.gen";
import { UserPlus } from "lucide-react";

export function CreateMerchantDialog() {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    ...merchantControllerCreateMerchantMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: merchantControllerListMerchantsQueryKey() });
      setOpen(false);
      setUserId("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) return;
    mutate({ body: { userId: userId.trim() } });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Create Merchant
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Merchant</DialogTitle>
          <DialogDescription>
            Promote an existing user to merchant role.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 py-4">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              placeholder="Enter user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending || !userId.trim()}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
