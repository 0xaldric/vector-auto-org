"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export type User = {
  id: string;
  email: string;
  displayName?: string;
  role: "admin" | "user" | "organizer";
  tags: string[];
  avatarUrl?: string;
  credit?: number;
};

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  organizer: "secondary",
  user: "outline",
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "avatar",
    header: "",
    cell: ({ row }) => {
      const user = row.original;
      const initials = user.displayName
        ? user.displayName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : user.email[0].toUpperCase();

      return (
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatarUrl} alt={user.displayName || user.email} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: "displayName",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.displayName || "—"}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <Badge variant={roleBadgeVariant[role] || "outline"}>
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "credit",
    header: "Credits",
    cell: ({ row }) => (
      <span className="font-mono">
        {row.original.credit != null ? row.original.credit.toLocaleString() : "—"}
      </span>
    ),
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.original.tags;
      if (!tags || tags.length === 0) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      );
    },
  },
];
