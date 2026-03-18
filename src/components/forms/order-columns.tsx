"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { FormOrderResponseDto } from "@/generated/types.gen";

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  completed: "default",
  running: "secondary",
  pending: "outline",
  cancelled: "destructive",
  failed: "destructive",
};

const statusLabel: Record<string, string> = {
  completed: "Completed",
  running: "Running",
  pending: "Pending",
  cancelled: "Cancelled",
  failed: "Failed",
};

export const orderColumns: ColumnDef<FormOrderResponseDto>[] = [
  {
    id: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.original.userId as unknown as { _id: string; email: string; displayName?: string; avatarUrl?: string | null } | string | null;
      if (!user || typeof user === "string") return <span className="text-muted-foreground text-sm">—</span>;
      const initials = user.displayName
        ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase()
        : user.email[0].toUpperCase();
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName || user.email} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            {user.displayName && (
              <span className="text-xs font-medium">{user.displayName}</span>
            )}
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    id: "form",
    header: "Form",
    cell: ({ row }) => {
      // After populate, formId is the populated object {_id, formId, url, title}
      const populated = row.original.formId as unknown as { title?: string; formId?: string } | string;
      const title =
        typeof populated === "object" && populated !== null
          ? populated.title
          : populated;
      const display = title ?? "—";
      const truncated = display.length > 40 ? display.slice(0, 40) + "…" : display;
      return (
        <span className="font-medium" title={display}>
          {truncated}
        </span>
      );
    },
  },
  {
    accessorKey: "answerStrategy",
    header: "Mode",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.answerStrategy}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={statusVariant[status] ?? "outline"}>
          {statusLabel[status] ?? status}
        </Badge>
      );
    },
  },
  {
    id: "progress",
    header: "Progress",
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.original.completedSubmissions} / {row.original.totalSubmissions}
      </span>
    ),
  },
  {
    accessorKey: "creditCost",
    header: "Credits",
    cell: ({ row }) => row.original.creditCost.toLocaleString(),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) =>
      new Date(row.original.created_at).toLocaleDateString("vi-VN"),
  },
];
