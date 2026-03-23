"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/generated/client.gen";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

const statusVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  preparing: "outline",
  pending: "outline",
  running: "secondary",
  idle: "secondary",
  paused: "outline",
  completed: "default",
  cancelled: "destructive",
  failed: "destructive",
};

const statusLabel: Record<string, string> = {
  preparing: "Preparing",
  pending: "Pending",
  running: "Running",
  idle: "Idle",
  paused: "Paused",
  completed: "Completed",
  cancelled: "Cancelled",
  failed: "Failed",
};

const modeLabel: Record<string, string> = {
  random_with_rate: "Random with Rate",
  from_sheet: "From Google Sheet",
  by_model: "By AI Model",
};

const submissionStatusVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "outline",
  success: "default",
  failed: "destructive",
};

interface OrderDetailSheetProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PopulatedForm {
  _id?: string;
  title?: string;
  url?: string;
  formId?: string;
  fields?: Array<{
    entryId: string;
    label: string;
    type: string;
    required: boolean;
    options: Array<{ value: string; label: string }>;
  }>;
}

interface PopulatedUser {
  _id?: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string | null;
}

interface SubmissionItem {
  _id: string;
  orderId: string;
  formId: string;
  answers: Record<string, string | string[]>;
  status: string;
  submittedAt: string | null;
  otherResponses?: Record<string, string>;
  errorMessage: string | null;
  created_at: string;
}

interface OrderDetail {
  _id: string;
  userId: string | PopulatedUser;
  formId: string | PopulatedForm;
  totalSubmissions: number;
  completedSubmissions: number;
  failedSubmissions: number;
  status: string;
  answerStrategy: string;
  answerConfig: Array<{
    entryId: string;
    rates: Record<string, number>;
  }>;
  answerGroups: Array<{
    weight: number;
    fixedAnswers: Record<string, string | string[]>;
  }>;
  creditCost: number;
  sheetUrl: string | null;
  cronConfig: {
    cronExpression: string;
    submissionsRangePerRun: [number, number];
    runDelayRangeMinutes: [number, number] | null;
    active: boolean;
  } | null;
  scheduleConfig: {
    durationDays: number;
    activeHoursRange: [number, number];
    startDate: string;
    endDate: string;
    weekdaysOnly: boolean;
    active: boolean;
  } | null;
  created_at: string;
  updated_at: string;
  submissions: {
    data: SubmissionItem[];
    meta: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

export function OrderDetailSheet({
  orderId,
  open,
  onOpenChange,
}: OrderDetailSheetProps) {
  const [subPage, setSubPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-order-detail", orderId, subPage],
    queryFn: async () => {
      const { data } = await client.get<{
        status: string;
        code: number;
        data: OrderDetail;
      }>({
        url: `/google-form/admin/orders/${orderId}`,
        query: { page: subPage, limit: 10 },
        security: [{ scheme: "bearer", type: "http" }],
        responseType: "json",
      });
      return data;
    },
    enabled: !!orderId && open,
  });

  const order = data?.data;
  const user =
    order?.userId && typeof order.userId === "object"
      ? (order.userId as PopulatedUser)
      : null;
  const form =
    order?.formId && typeof order.formId === "object"
      ? (order.formId as PopulatedForm)
      : null;
  const subs = order?.submissions;

  // Build entryId -> label map from form fields
  const fieldLabelMap: Record<string, string> =
    form?.fields?.reduce(
      (acc, f) => {
        acc[f.entryId] = f.label;
        return acc;
      },
      {} as Record<string, string>
    ) ?? {};

  // Collect all unique entryIds from submissions for table columns
  const allEntryIds: string[] = [];
  if (subs?.data?.length) {
    const set = new Set<string>();
    for (const sub of subs.data) {
      if (sub.answers) {
        for (const key of Object.keys(sub.answers)) {
          set.add(key);
        }
      }
    }
    allEntryIds.push(...set);
  }

  const percent =
    order && order.totalSubmissions > 0
      ? Math.round(
          (order.completedSubmissions / order.totalSubmissions) * 100
        )
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Detail</DialogTitle>
          <DialogDescription>
            {orderId ? `ID: ${orderId}` : ""}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : !order ? (
          <p className="text-sm text-muted-foreground">Order not found.</p>
        ) : (
          <div className="space-y-5">
            {/* Status & Progress */}
            <div className="flex items-center justify-between">
              <Badge variant={statusVariant[order.status] ?? "outline"}>
                {statusLabel[order.status] ?? order.status}
              </Badge>
              <span className="font-mono text-sm text-muted-foreground">
                {percent}% ({order.completedSubmissions}/
                {order.totalSubmissions})
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>

            {/* Info grid: User + Order + Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* User */}
              {user && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">
                    User
                  </h4>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.avatarUrl ?? undefined}
                        alt={user.displayName || user.email}
                      />
                      <AvatarFallback className="text-xs">
                        {user.displayName
                          ? user.displayName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                          : user.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      {user.displayName && (
                        <p className="text-sm font-medium">
                          {user.displayName}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Info */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">
                  Order Info
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">Mode</span>
                    <p className="font-medium text-xs">
                      {modeLabel[order.answerStrategy] ?? order.answerStrategy}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">
                      Credits
                    </span>
                    <p className="font-medium text-xs">
                      {order.creditCost.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">
                      Completed
                    </span>
                    <p className="font-medium text-xs flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                      {order.completedSubmissions.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">
                      Failed
                    </span>
                    <p
                      className={`font-medium text-xs flex items-center gap-1 ${order.failedSubmissions > 0 ? "text-destructive" : ""}`}
                    >
                      <XCircle className="h-3 w-3" />
                      {order.failedSubmissions.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">
                      Created
                    </span>
                    <p className="font-medium text-xs">
                      {new Date(order.created_at).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">
                      Updated
                    </span>
                    <p className="font-medium text-xs">
                      {new Date(order.updated_at).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Info */}
              {form && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">
                    Form
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    {form.title && (
                      <p className="font-medium text-xs">{form.title}</p>
                    )}
                    {form.formId && (
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                          {form.formId}
                        </code>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => copyToClipboard(form.formId!)}
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    {form.url && (
                      <a
                        href={form.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Open Google Form
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sheet URL */}
            {order.sheetUrl && (
              <>
                <Separator />
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">
                    Google Sheet
                  </h4>
                  <a
                    href={order.sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline break-all"
                  >
                    {order.sheetUrl}
                  </a>
                </div>
              </>
            )}

            {/* Schedule / Cron side by side */}
            {(order.scheduleConfig || order.cronConfig) && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.scheduleConfig && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Schedule Config
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Start</span>
                          <p className="font-medium">
                            {new Date(
                              order.scheduleConfig.startDate
                            ).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">End</span>
                          <p className="font-medium">
                            {new Date(
                              order.scheduleConfig.endDate
                            ).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Duration
                          </span>
                          <p className="font-medium">
                            {order.scheduleConfig.durationDays} days
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Hours</span>
                          <p className="font-medium">
                            {order.scheduleConfig.activeHoursRange[0]}h –{" "}
                            {order.scheduleConfig.activeHoursRange[1]}h
                          </p>
                        </div>
                        {order.scheduleConfig.weekdaysOnly && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Days</span>
                            <p className="font-medium">Weekdays only</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {order.cronConfig && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Cron Config
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">
                            Expression
                          </span>
                          <p className="font-mono font-medium">
                            {order.cronConfig.cronExpression}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Per Run
                          </span>
                          <p className="font-medium">
                            {order.cronConfig.submissionsRangePerRun[0]} –{" "}
                            {order.cronConfig.submissionsRangePerRun[1]}
                          </p>
                        </div>
                        {order.cronConfig.runDelayRangeMinutes && (
                          <div>
                            <span className="text-muted-foreground">
                              Delay
                            </span>
                            <p className="font-medium">
                              {order.cronConfig.runDelayRangeMinutes[0]} –{" "}
                              {order.cronConfig.runDelayRangeMinutes[1]} min
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Status</span>
                          <p className="font-medium">
                            {order.cronConfig.active ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Answer Config */}
            {order.answerConfig?.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">
                    Answer Config ({order.answerConfig.length} fields)
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {order.answerConfig.map((cfg) => (
                      <div
                        key={cfg.entryId}
                        className="rounded border p-2 text-xs"
                      >
                        <p
                          className="font-medium mb-1 truncate"
                          title={fieldLabelMap[cfg.entryId] ?? cfg.entryId}
                        >
                          {fieldLabelMap[cfg.entryId] ?? cfg.entryId}
                        </p>
                        {Object.keys(cfg.rates).length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(cfg.rates).map(([opt, rate]) => (
                              <span
                                key={opt}
                                className="inline-flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5"
                              >
                                <span className="truncate max-w-[120px]">
                                  {opt}
                                </span>
                                <span className="text-muted-foreground">
                                  :{rate}
                                </span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Answer Groups */}
            {order.answerGroups?.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">
                    Answer Groups ({order.answerGroups.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {order.answerGroups.map((group, idx) => (
                      <div key={idx} className="rounded border p-2 text-xs">
                        <p className="font-medium mb-1">
                          Group {idx + 1} (weight: {group.weight})
                        </p>
                        <div className="space-y-0.5">
                          {Object.entries(group.fixedAnswers).map(
                            ([entryId, value]) => (
                              <div
                                key={entryId}
                                className="flex gap-2 items-start"
                              >
                                <span
                                  className="text-muted-foreground shrink-0 truncate max-w-[140px]"
                                  title={fieldLabelMap[entryId] ?? entryId}
                                >
                                  {fieldLabelMap[entryId] ?? entryId}:
                                </span>
                                <span className="font-medium break-all">
                                  {Array.isArray(value)
                                    ? value.join(", ")
                                    : value}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Submissions Table */}
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-medium text-muted-foreground">
                  Submissions
                  {subs?.meta && (
                    <span className="ml-1">({subs.meta.totalItems} total)</span>
                  )}
                </h4>
                {subs?.meta && subs.meta.totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={subPage <= 1}
                      onClick={() => setSubPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <span className="text-xs text-muted-foreground px-2">
                      {subPage}/{subs.meta.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={subPage >= subs.meta.totalPages}
                      onClick={() => setSubPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              {!subs?.data?.length ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No submissions yet.
                </p>
              ) : (
                <div className="max-h-[340px] overflow-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead className="w-[80px]">Status</TableHead>
                        <TableHead className="w-[140px]">Time</TableHead>
                        {allEntryIds.map((entryId) => (
                          <TableHead
                            key={entryId}
                            className="max-w-[200px]"
                            title={fieldLabelMap[entryId] ?? entryId}
                          >
                            <span className="truncate block max-w-[180px]">
                              {fieldLabelMap[entryId] ?? entryId}
                            </span>
                          </TableHead>
                        ))}
                        <TableHead className="w-[180px]">Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subs.data.map((sub, idx) => (
                        <TableRow key={sub._id}>
                          <TableCell className="text-xs text-muted-foreground">
                            {(subPage - 1) * 10 + idx + 1}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                submissionStatusVariant[sub.status] ?? "outline"
                              }
                              className="text-[10px]"
                            >
                              {sub.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {sub.submittedAt
                              ? new Date(sub.submittedAt).toLocaleString(
                                  "vi-VN",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : new Date(sub.created_at).toLocaleString(
                                  "vi-VN",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                          </TableCell>
                          {allEntryIds.map((entryId) => {
                            const val = sub.answers?.[entryId];
                            return (
                              <TableCell
                                key={entryId}
                                className="text-xs max-w-[200px]"
                              >
                                <span
                                  className="truncate block max-w-[180px]"
                                  title={
                                    Array.isArray(val)
                                      ? val.join(", ")
                                      : val ?? ""
                                  }
                                >
                                  {Array.isArray(val)
                                    ? val.join(", ")
                                    : val ?? (
                                        <span className="text-muted-foreground">
                                          —
                                        </span>
                                      )}
                                </span>
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-xs">
                            {sub.errorMessage && (
                              <span
                                className="text-destructive flex items-start gap-1 max-w-[160px]"
                                title={sub.errorMessage}
                              >
                                <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                                <span className="truncate">
                                  {sub.errorMessage}
                                </span>
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
