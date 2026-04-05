"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  blogControllerAdminFindById,
  blogControllerUpdate,
} from "@/generated/sdk.gen";
import type { UpdateBlogDto } from "@/generated/types.gen";
import { Header } from "@/components/layout/header";
import { BlogForm } from "@/components/blog/blog-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["blog-detail", id],
    queryFn: async () => {
      const { data } = await blogControllerAdminFindById({ path: { id } });
      return data;
    },
    enabled: !!id,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (body: UpdateBlogDto) => {
      const { data } = await blogControllerUpdate({ path: { id }, body });
      return data;
    },
    onSuccess: () => {
      toast.success("Cập nhật bài viết thành công");
      queryClient.invalidateQueries({ queryKey: ["blog-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["blog-list"] });
      queryClient.invalidateQueries({ queryKey: ["blog-stats"] });
    },
    onError: () => {
      toast.error("Cập nhật bài viết thất bại");
    },
  });

  const blog = data?.data;

  return (
    <>
      <Header title={blog?.title ?? "Chỉnh sửa bài viết"} />
      <div className="flex-1 space-y-6 p-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Link>
        </Button>

        {isLoading ? (
          <div className="max-w-3xl space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : blog ? (
          <div className="max-w-3xl">
            <BlogForm
              initialData={{
                title: blog.title,
                slug: blog.slug,
                excerpt: blog.excerpt,
                coverImage: blog.coverImage,
                tags: blog.tags,
                content: blog.content,
                status: blog.status,
              }}
              onSubmit={async (formData) => {
                await mutateAsync(formData);
              }}
              isSubmitting={isPending}
            />
          </div>
        ) : (
          <p className="text-muted-foreground">Không tìm thấy bài viết.</p>
        )}
      </div>
    </>
  );
}
