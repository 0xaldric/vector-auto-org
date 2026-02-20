"use client";

import { useSession } from "next-auth/react";
import { Users, Shield, UserCheck, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { useUsersControllerGetUsers } from "@/generated/api";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: usersData } = useUsersControllerGetUsers({ page: 1, limit: 100 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = usersData as any;
  const users = response?.data?.data as Array<{ role: string }> | undefined;

  const totalUsers = response?.data?.meta?.totalItems ?? users?.length ?? 0;
  const adminCount = users?.filter((u) => u.role === "admin").length ?? 0;
  const organizerCount = users?.filter((u) => u.role === "organizer").length ?? 0;
  const userCount = users?.filter((u) => u.role === "user").length ?? 0;

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      description: "All registered users",
    },
    {
      title: "Admins",
      value: adminCount,
      icon: Shield,
      description: "Administrator accounts",
    },
    {
      title: "Organizers",
      value: organizerCount,
      icon: UserCheck,
      description: "Organizer accounts",
    },
    {
      title: "Regular Users",
      value: userCount,
      icon: Activity,
      description: "Standard user accounts",
    },
  ];

  return (
    <>
      <Header title="Dashboard" />
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {session?.user?.name || "Admin"}
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your platform.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
