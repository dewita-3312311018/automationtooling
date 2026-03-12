import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useRequest } from "../api";
import { formatDate } from "@/lib/format";
import { statusVariantMap } from "../types";
import { Separator } from "@/components/ui/separator";

interface RequestDetailSheetProps {
  id: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestDetailSheet({ id, open, onOpenChange }: RequestDetailSheetProps) {
  const { data: request, isLoading } = useRequest(id || "");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>Request Details</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center px-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : request ? (
          <div className="space-y-6 px-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <Badge variant={statusVariantMap[request.status]} className="capitalize">
                  {request.status.toLowerCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Urgency</span>
                <Badge variant={request.urgency === "high" ? "destructive" : "secondary"} className="capitalize">
                  {request.urgency}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4">
              <div className="grid gap-1">
                <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Model Number</div>
                    <div className="text-lg font-mono">{request.modelNumber}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">Quantity</div>
                    <div className="text-lg">{request.quantity}</div>
                  </div>
                </div>
              </div>

              <div className="grid gap-1 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">PO Number</div>
                    <div className="text-sm font-mono">{request.poNumber || "—"}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">ETA</div>
                    <div className="text-sm">{request.eta || "—"}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">User Note</div>
                  <div className="text-sm bg-muted/50 p-2 rounded border italic">
                    {request.note || "No note provided"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Admin Note</div>
                  <div className="text-sm bg-muted/50 p-2 rounded border">
                    {request.adminNote || "—"}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between text-[11px] text-muted-foreground font-medium gap-2 border-t pt-4">
                <span>Created: {formatDate(request.createdAt, { hour: "2-digit", minute: "2-digit" })}</span>
                <span>Updated: {formatDate(request.updatedAt, { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">Request not found.</div>
        )}
      </SheetContent>
    </Sheet>
  );
}
