"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { feedbackControllerFindAll } from "@/generated/sdk.gen";
import type { FeedbackWithUserDto } from "@/generated/types.gen";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Phone, User } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";

export default function FeedbackPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["feedbacks", page],
    queryFn: async () => {
      const { data } = await feedbackControllerFindAll({
        query: { page, limit },
      });
      return data;
    },
  });

  const feedbacks = (data?.data?.data ?? []) as FeedbackWithUserDto[];
  const meta = data?.data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const totalItems = meta?.totalItems ?? 0;

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>
          <p className="text-muted-foreground text-sm">
            {totalItems} phản hồi từ người dùng
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" />
          {totalItems} tổng
        </Badge>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : feedbacks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <MessageSquare className="h-10 w-10 opacity-30" />
            <p className="font-medium">Chưa có feedback nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((fb) => (
            <Card key={fb._id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {fb.user?.displayName ?? fb.user?.email ?? fb.userId}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {fb.user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {(fb.phoneNumber ?? fb.user?.phoneNumber) && (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <Phone className="h-3 w-3" />
                        {fb.phoneNumber ?? fb.user?.phoneNumber}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(fb.created_at)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{fb.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
  );
}
