"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  blogControllerAdminFindAll,
  blogControllerGetStats,
  blogControllerDelete,
} from "@/generated/sdk.gen";
import type { BlogStatsDto, PaginatedBlogResponseDto } from "@/generated/types.gen";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BlogTable } from "@/components/blog/blog-columns";
import {
  FileText,
  Globe,
  Eye,
  Heart,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function BlogPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const limit = 10;

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["blog-stats"],
    queryFn: async () => {
      const { data } = await blogControllerGetStats();
      return data;
    },
  });

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ["blog-list", page, statusFilter],
    queryFn: async () => {
      const { data } = await blogControllerAdminFindAll({
        query: {
          page,
          limit,
          ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        } as Record<string, unknown>,
      });
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await blogControllerDelete({ path: { id } });
    },
    onSuccess: () => {
      toast.success("Xoá bài viết thành công");
      queryClient.invalidateQueries({ queryKey: ["blog-list"] });
      queryClient.invalidateQueries({ queryKey: ["blog-stats"] });
      setDeleteId(null);
    },
    onError: () => {
      toast.error("Xoá bài viết thất bại");
    },
  });

  const stats = statsData?.data;
  const blogs = listData?.data?.data ?? [];
  const meta = listData?.data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const blogItems = blogs.map((b) => ({
    _id: b._id,
    title: b.title,
    status: b.status,
    views: b.viewCount,
    likes: b.likeCount,
    comments: b.commentCount,
    createdAt: b.created_at,
  }));

  const statCards = [
    {
      title: "Tổng bài viết",
      value: stats?.totalPosts ?? 0,
      icon: FileText,
    },
    {
      title: "Đã xuất bản",
      value: stats?.totalPublished ?? 0,
      icon: Globe,
    },
    {
      title: "Lượt xem",
      value: stats?.totalViews ?? 0,
      icon: Eye,
    },
    {
      title: "Lượt thích",
      value: stats?.totalLikes ?? 0,
      icon: Heart,
    },
  ];

  const statusFilters: { label: string; value: "all" | "published" | "draft" }[] = [
    { label: "Tất cả", value: "all" },
    { label: "Xuất bản", value: "published" },
    { label: "Bản nháp", value: "draft" },
  ];

  return (
    <>
      <Header title="Blog" />
      <div className="flex-1 space-y-6 p-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))
            : statCards.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stat.value.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {statusFilters.map((f) => (
              <Button
                key={f.value}
                variant={statusFilter === f.value ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setStatusFilter(f.value);
                  setPage(1);
                }}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <Button asChild>
            <Link href="/blog/new">
              <Plus className="mr-2 h-4 w-4" />
              Tạo bài viết
            </Link>
          </Button>
        </div>

        {/* Table */}
        {listLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : blogItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
              <FileText className="h-10 w-10 opacity-30" />
              <p className="font-medium">Chưa có bài viết nào</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <BlogTable
                blogs={blogItems}
                onEdit={(id) => router.push(`/blog/${id}`)}
                onDelete={(id) => setDeleteId(id)}
              />
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Trước
            </Button>
            <span className="flex items-center px-3 text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </Button>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xoá bài viết</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bạn có chắc chắn muốn xoá bài viết này? Hành động này không thể
            hoàn tác.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Huỷ
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              {deleteMutation.isPending ? "Đang xoá..." : "Xoá"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
