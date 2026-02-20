"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { DataTable } from "@/components/users/data-table";
import { columns, User } from "@/components/users/columns";
import { useUsersControllerGetUsers } from "@/generated/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: usersData, isLoading } = useUsersControllerGetUsers({
    page,
    limit,
  });

  // API response shape: { status, code, data: { data: User[], meta: {...} } }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = usersData as any;
  const users: User[] = response?.data?.data ?? [];
  const totalPages: number = response?.data?.meta?.totalPages ?? 1;

  return (
    <>
      <Header title="User Management" />
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">
            Manage and view all registered users.
          </p>
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
