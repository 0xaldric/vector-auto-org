"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  content: string;
  status: "draft" | "published";
}

interface BlogFormProps {
  initialData?: Partial<BlogFormData>;
  onSubmit: (data: BlogFormData) => Promise<void>;
  isSubmitting: boolean;
}

function generateSlug(title: string): string {
  const vietnameseMap: Record<string, string> = {
    à: "a", á: "a", ả: "a", ã: "a", ạ: "a",
    ă: "a", ằ: "a", ắ: "a", ẳ: "a", ẵ: "a", ặ: "a",
    â: "a", ầ: "a", ấ: "a", ẩ: "a", ẫ: "a", ậ: "a",
    đ: "d",
    è: "e", é: "e", ẻ: "e", ẽ: "e", ẹ: "e",
    ê: "e", ề: "e", ế: "e", ể: "e", ễ: "e", ệ: "e",
    ì: "i", í: "i", ỉ: "i", ĩ: "i", ị: "i",
    ò: "o", ó: "o", ỏ: "o", õ: "o", ọ: "o",
    ô: "o", ồ: "o", ố: "o", ổ: "o", ỗ: "o", ộ: "o",
    ơ: "o", ờ: "o", ớ: "o", ở: "o", ỡ: "o", ợ: "o",
    ù: "u", ú: "u", ủ: "u", ũ: "u", ụ: "u",
    ư: "u", ừ: "u", ứ: "u", ử: "u", ữ: "u", ự: "u",
    ỳ: "y", ý: "y", ỷ: "y", ỹ: "y", ỵ: "y",
  };

  return title
    .toLowerCase()
    .split("")
    .map((char) => vietnameseMap[char] || char)
    .join("")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function BlogForm({ initialData, onSubmit, isSubmitting }: BlogFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? "");
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags?.join(", ") ?? ""
  );
  const [content, setContent] = useState(initialData?.content ?? "");
  const [status, setStatus] = useState<"draft" | "published">(
    initialData?.status ?? "draft"
  );
  const [showPreview, setShowPreview] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(generateSlug(title));
    }
  }, [title, slugManuallyEdited]);

  const buildFormData = (overrideStatus?: "draft" | "published"): BlogFormData => ({
    title,
    slug,
    excerpt,
    coverImage,
    tags: tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    content,
    status: overrideStatus ?? status,
  });

  const handleSubmitDraft = async () => {
    await onSubmit(buildFormData("draft"));
  };

  const handleSubmitPublish = async () => {
    await onSubmit(buildFormData("published"));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Tiêu đề *</Label>
          <Input
            id="title"
            placeholder="Nhập tiêu đề bài viết"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            placeholder="tu-dong-tao-tu-tieu-de"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugManuallyEdited(true);
            }}
          />
          <p className="text-xs text-muted-foreground">
            Tự động tạo từ tiêu đề. Có thể chỉnh sửa.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Mô tả ngắn</Label>
        <Textarea
          id="excerpt"
          placeholder="Mô tả ngắn cho bài viết (tối đa 500 ký tự)"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          maxLength={500}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          {excerpt.length}/500 ký tự
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="coverImage">Ảnh bìa (URL)</Label>
          <Input
            id="coverImage"
            placeholder="https://example.com/image.jpg"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            placeholder="tag1, tag2, tag3"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Phân cách bằng dấu phẩy
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="content">Nội dung *</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <EyeOff className="mr-1 h-4 w-4" />
            ) : (
              <Eye className="mr-1 h-4 w-4" />
            )}
            {showPreview ? "Ẩn xem trước" : "Xem trước"}
          </Button>
        </div>
        {showPreview ? (
          <Card>
            <CardContent className="prose prose-sm max-w-none p-4">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                {content || "Chưa có nội dung"}
              </pre>
            </CardContent>
          </Card>
        ) : (
          <Textarea
            id="content"
            placeholder="Viết nội dung bài viết (hỗ trợ Markdown)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            required
          />
        )}
        <p className="text-xs text-muted-foreground">Hỗ trợ Markdown</p>
      </div>

      <div className="space-y-2">
        <Label>Trạng thái</Label>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as "draft" | "published")}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Bản nháp</SelectItem>
            <SelectItem value="published">Xuất bản</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={handleSubmitDraft}
          disabled={isSubmitting || !title.trim() || !content.trim()}
        >
          Lưu nháp
        </Button>
        <Button
          onClick={handleSubmitPublish}
          disabled={isSubmitting || !title.trim() || !content.trim()}
        >
          Xuất bản
        </Button>
      </div>
    </div>
  );
}
