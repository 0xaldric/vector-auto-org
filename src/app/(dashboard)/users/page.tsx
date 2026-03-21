"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { DataTable } from "@/components/users/data-table";
import { columns } from "@/components/users/columns";
import { useQuery } from "@tanstack/react-query";
import { usersControllerGetUsersOptions } from "@/generated/@tanstack/react-query.gen";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [emailInput, setEmailInput] = useState("");
  const [email, setEmail] = useState<string | undefined>(undefined);
  const limit = 10;

  const { data: usersData, isLoading } = useQuery(usersControllerGetUsersOptions({
    query: { page, limit, ...(email ? { email } : {}) },
  }));

  function handleEmailSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setEmail(emailInput.trim() || undefined);
  }

  const users = usersData?.data?.data ?? [];
  const totalPages = usersData?.data?.meta?.totalPages ?? 1;

  return (
    <>
      <Header title="User Management" />
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Users</h2>
            <p className="text-muted-foreground">
              Manage and view all registered users.
            </p>
          </div>
          <form onSubmit={handleEmailSearch} className="flex gap-2">
            <Input
              placeholder="Search by email..."
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-64"
            />
          </form>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={users}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </>
  );
}
