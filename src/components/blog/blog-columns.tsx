"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";

export interface BlogItem {
  _id: string;
  title: string;
  status: "draft" | "published";
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
}

interface BlogTableProps {
  blogs: BlogItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function BlogTable({ blogs, onEdit, onDelete }: BlogTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[240px]">Tiêu đề</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead className="text-right">Lượt xem</TableHead>
          <TableHead className="text-right">Lượt thích</TableHead>
          <TableHead className="text-right">Bình luận</TableHead>
          <TableHead>Ngày tạo</TableHead>
          <TableHead className="text-right">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {blogs.map((blog) => (
          <TableRow
            key={blog._id}
            className="cursor-pointer"
            onClick={() => onEdit(blog._id)}
          >
            <TableCell className="font-medium max-w-[300px] truncate">
              {blog.title}
            </TableCell>
            <TableCell>
              <Badge
                variant={blog.status === "published" ? "default" : "secondary"}
                className={
                  blog.status === "published"
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                }
              >
                {blog.status === "published" ? "Xuất bản" : "Bản nháp"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {blog.views?.toLocaleString() ?? 0}
            </TableCell>
            <TableCell className="text-right">
              {blog.likes?.toLocaleString() ?? 0}
            </TableCell>
            <TableCell className="text-right">
              {blog.comments?.toLocaleString() ?? 0}
            </TableCell>
            <TableCell>{formatDistanceToNow(blog.createdAt)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(blog._id);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(blog._id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
