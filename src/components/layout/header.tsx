"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { UserNav } from "./user-nav";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="ml-auto">
        <UserNav />
      </div>
    </header>
  );
}
