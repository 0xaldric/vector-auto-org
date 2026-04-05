"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { blogControllerCreate } from "@/generated/sdk.gen";
import type { CreateBlogDto } from "@/generated/types.gen";
import { Header } from "@/components/layout/header";
import { BlogForm } from "@/components/blog/blog-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CreateBlogPage() {
  const router = useRouter();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (body: CreateBlogDto) => {
      const { data } = await blogControllerCreate({ body });
      return data;
    },
    onSuccess: () => {
      toast.success("Tạo bài viết thành công");
      router.push("/blog");
    },
    onError: () => {
      toast.error("Tạo bài viết thất bại");
    },
  });

  return (
    <>
      <Header title="Tạo bài viết mới" />
      <div className="flex-1 space-y-6 p-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Link>
        </Button>

        <div className="max-w-3xl">
          <BlogForm
            onSubmit={async (data) => {
              await mutateAsync(data);
            }}
            isSubmitting={isPending}
          />
        </div>
      </div>
    </>
  );
}
