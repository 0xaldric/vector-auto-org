"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PlusCircle, Pencil, Trash2, Star } from "lucide-react";
import {
  packageControllerFindAllOptions,
  packageControllerFindAllQueryKey,
  packageControllerCreateMutation,
  packageControllerUpdateMutation,
  packageControllerRemoveMutation,
} from "@/generated/@tanstack/react-query.gen";
import type { CreatePackageDto, UpdatePackageDto } from "@/generated/types.gen";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Package = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  totalOrders: number;
  maxSubmissionsPerOrder: number;
  isActive: boolean;
  sortOrder: number;
  isRecommended: boolean;
};

type FormState = {
  name: string;
  description: string;
  price: string;
  totalOrders: string;
  maxSubmissionsPerOrder: string;
  isActive: boolean;
  sortOrder: string;
  isRecommended: boolean;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  totalOrders: "",
  maxSubmissionsPerOrder: "",
  isActive: true,
  sortOrder: "0",
  isRecommended: false,
};

function packageToForm(pkg: Package): FormState {
  return {
    name: pkg.name,
    description: pkg.description ?? "",
    price: String(pkg.price),
    totalOrders: String(pkg.totalOrders),
    maxSubmissionsPerOrder: String(pkg.maxSubmissionsPerOrder),
    isActive: pkg.isActive,
    sortOrder: String(pkg.sortOrder),
    isRecommended: pkg.isRecommended,
  };
}

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ---------------------------------------------------------------------------
// Package form dialog (create / edit)
// ---------------------------------------------------------------------------

interface PackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPackage: Package | null;
  onClose: () => void;
}

function PackageDialog({
  open,
  onOpenChange,
  editingPackage,
  onClose,
}: PackageDialogProps) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormState>(
    editingPackage ? packageToForm(editingPackage) : emptyForm
  );

  // Keep form in sync when dialog opens with different package
  const handleOpenChange = (value: boolean) => {
    if (value) {
      setForm(editingPackage ? packageToForm(editingPackage) : emptyForm);
    }
    onOpenChange(value);
  };

  const createMutation = useMutation({
    ...packageControllerCreateMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: packageControllerFindAllQueryKey(),
      });
      toast.success("Tạo gói thành công");
      onClose();
    },
    onError: () => {
      toast.error("Tạo gói thất bại");
    },
  });

  const updateMutation = useMutation({
    ...packageControllerUpdateMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: packageControllerFindAllQueryKey(),
      });
      toast.success("Cập nhật gói thành công");
      onClose();
    },
    onError: () => {
      toast.error("Cập nhật gói thất bại");
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const dto: CreatePackageDto = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: Number(form.price),
      totalOrders: Number(form.totalOrders),
      maxSubmissionsPerOrder: Number(form.maxSubmissionsPerOrder),
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder),
      isRecommended: form.isRecommended,
    };

    if (editingPackage) {
      const updateDto: UpdatePackageDto = dto;
      updateMutation.mutate({
        path: { id: editingPackage._id },
        body: updateDto,
      });
    } else {
      createMutation.mutate({ body: dto });
    }
  }

  const isEditing = Boolean(editingPackage);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa gói dịch vụ" : "Tạo gói mới"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Cập nhật thông tin gói dịch vụ."
              : "Điền thông tin để tạo gói dịch vụ mới."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="pkg-name">Tên gói *</Label>
              <Input
                id="pkg-name"
                placeholder="Ví dụ: Gói Cơ Bản"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="pkg-desc">Mô tả</Label>
              <Input
                id="pkg-desc"
                placeholder="Mô tả ngắn về gói"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              />
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <Label htmlFor="pkg-price">Giá (VND) *</Label>
              <Input
                id="pkg-price"
                type="number"
                min={0}
                placeholder="0"
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
                required
              />
            </div>

            {/* totalOrders / maxSubmissionsPerOrder */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pkg-orders">Số đơn hàng *</Label>
                <Input
                  id="pkg-orders"
                  type="number"
                  min={1}
                  placeholder="10"
                  value={form.totalOrders}
                  onChange={(e) => setField("totalOrders", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pkg-max-sub">
                  Số lần nộp tối đa / đơn *
                </Label>
                <Input
                  id="pkg-max-sub"
                  type="number"
                  min={1}
                  placeholder="3"
                  value={form.maxSubmissionsPerOrder}
                  onChange={(e) =>
                    setField("maxSubmissionsPerOrder", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            {/* sortOrder */}
            <div className="space-y-1.5">
              <Label htmlFor="pkg-sort">Thứ tự hiển thị</Label>
              <Input
                id="pkg-sort"
                type="number"
                value={form.sortOrder}
                onChange={(e) => setField("sortOrder", e.target.value)}
              />
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setField("isActive", e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                Kích hoạt
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isRecommended}
                  onChange={(e) => setField("isRecommended", e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                Nổi bật / Đề xuất
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? isEditing
                  ? "Đang lưu..."
                  : "Đang tạo..."
                : isEditing
                ? "Lưu thay đổi"
                : "Tạo gói"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Delete confirmation dialog
// ---------------------------------------------------------------------------

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pkg: Package | null;
  onClose: () => void;
}

function DeleteDialog({ open, onOpenChange, pkg, onClose }: DeleteDialogProps) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    ...packageControllerRemoveMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: packageControllerFindAllQueryKey(),
      });
      toast.success("Đã xóa gói dịch vụ");
      onClose();
    },
    onError: () => {
      toast.error("Xóa gói thất bại");
    },
  });

  function handleConfirm() {
    if (!pkg) return;
    mutate({ path: { id: pkg._id } });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogDescription>
            Bạn có chắc muốn xóa gói{" "}
            <span className="font-semibold">{pkg?.name}</span>? Hành động này
            không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function PackagesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(packageControllerFindAllOptions());
  const rawData = data as any;
  const packages: Package[] = Array.isArray(rawData) ? rawData : (rawData?.data ?? []);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null);

  // Toggle active
  const toggleActiveMutation = useMutation({
    ...packageControllerUpdateMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: packageControllerFindAllQueryKey(),
      });
      toast.success("Đã cập nhật trạng thái");
    },
    onError: () => {
      toast.error("Cập nhật trạng thái thất bại");
    },
  });

  function openCreate() {
    setEditingPackage(null);
    setFormOpen(true);
  }

  function openEdit(pkg: Package) {
    setEditingPackage(pkg);
    setFormOpen(true);
  }

  function openDelete(pkg: Package) {
    setDeletingPackage(pkg);
    setDeleteOpen(true);
  }

  function handleToggleActive(pkg: Package) {
    toggleActiveMutation.mutate({
      path: { id: pkg._id },
      body: { isActive: !pkg.isActive },
    });
  }

  return (
    <>
      <Header title="Gói dịch vụ" />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Quản lý gói dịch vụ
            </h2>
            <p className="text-muted-foreground">
              Tạo và chỉnh sửa các gói đặt hàng cho khách hàng.
            </p>
          </div>
          <Button onClick={openCreate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tạo gói mới
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : packages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Chưa có gói dịch vụ nào.
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên gói</TableHead>
                  <TableHead className="text-right">Giá (VND)</TableHead>
                  <TableHead className="text-center">Số đơn</TableHead>
                  <TableHead className="text-center">Nộp tối đa / đơn</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-center">Đề xuất</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg._id}>
                    <TableCell>
                      <div className="font-medium">{pkg.name}</div>
                      {pkg.description && (
                        <div className="text-xs text-muted-foreground">
                          {pkg.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatVND(pkg.price)}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {pkg.totalOrders}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {pkg.maxSubmissionsPerOrder}
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => handleToggleActive(pkg)}
                        disabled={toggleActiveMutation.isPending}
                        className="cursor-pointer"
                        title={
                          pkg.isActive ? "Nhấn để tắt" : "Nhấn để kích hoạt"
                        }
                      >
                        <Badge
                          variant={pkg.isActive ? "default" : "secondary"}
                        >
                          {pkg.isActive ? "Hoạt động" : "Tạm dừng"}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="text-center">
                      {pkg.isRecommended ? (
                        <Star className="mx-auto h-4 w-4 fill-amber-400 text-amber-400" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(pkg)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Chỉnh sửa</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => openDelete(pkg)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Xóa</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create / Edit dialog */}
      <PackageDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingPackage={editingPackage}
        onClose={() => {
          setFormOpen(false);
          setEditingPackage(null);
        }}
      />

      {/* Delete confirmation dialog */}
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        pkg={deletingPackage}
        onClose={() => {
          setDeleteOpen(false);
          setDeletingPackage(null);
        }}
      />
    </>
  );
}
