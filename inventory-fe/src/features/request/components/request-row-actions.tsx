import { useState } from "react";
import { CalendarClock, MoreHorizontal, PackageCheck, Send, Truck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LocationPicker } from "../../location/components/location-picker";
import { StockPicker } from "../../stock/components/stock-picker";
import { useReviewRequest } from "../api/use-review-request";
import { toast } from "sonner";
import { PermissionGuard } from "@/features/rbac/components/permission-guard";
import { Permissions } from "@/features/rbac/utils/permission-constants";
import type { RequestInfo } from "../types";
import { useQueryState, parseAsString } from "nuqs";

interface RequestRowActionsProps {
  request: RequestInfo;
}

function RequestRowActions({ request }: RequestRowActionsProps) {
  const [_, setRequestId] = useQueryState("requestId", parseAsString.withDefault(""));
  const [action, setAction] = useState<"APPROVE" | "REJECT" | "ORDER" | "ARRIVED" | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [eta, setEta] = useState("");
  const [locationId, setLocationId] = useState("");

  const [assignType, setAssignType] = useState<"existing" | "new">("existing");
  const [existingStockId, setExistingStockId] = useState("");
  const [newStockUom, setNewStockUom] = useState("pcs");
  const [newStockType, setNewStockType] = useState<"mechanical" | "electrical">("mechanical");
  const [newStockMinLevel, setNewStockMinLevel] = useState("");

  const { mutate, isPending } = useReviewRequest();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setAction(null);
      setAdminNote("");
      setPoNumber("");
      setEta("");
      setLocationId("");
    }
  };

  const onSubmit = () => {
    if (action === "REJECT" && !adminNote.trim()) {
      toast.error("Rejection requires an admin note.");
      return;
    }

    // Withdrawal approval requires location
    if (request.type === "withdrawal" && action === "APPROVE" && !locationId) {
      toast.error("Please select a location to withdraw from.");
      return;
    }

    if (action === "ARRIVED" && !request.stockId) {
      if (assignType === "existing" && !existingStockId) {
        toast.error("Please select an existing stock item.");
        return;
      }
      if (assignType === "new" && (!newStockUom || !newStockType)) {
        toast.error("Please provide UOM and Type for the new stock.");
        return;
      }
    }

    const status =
      action === "APPROVE"
        ? "APPROVED"
        : action === "REJECT"
          ? "REJECTED"
          : action === "ORDER"
            ? "ORDERED"
            : "ARRIVED";

    mutate(
      {
        id: request.id,
        status,
        adminNote: adminNote || undefined,
        poNumber: poNumber || undefined,
        eta: eta || undefined,
        locationId: locationId || undefined,
        ...(action === "ARRIVED" && !request.stockId
          ? {
              existingStockId: assignType === "existing" ? existingStockId : undefined,
              newStockDetails:
                assignType === "new"
                  ? {
                      uom: newStockUom,
                      type: newStockType,
                      minStockLevel: newStockMinLevel ? parseInt(newStockMinLevel) : 0,
                      projectType: undefined, // or add a field if needed
                    }
                  : undefined,
            }
          : {}),
      },
      {
        onSuccess: () => {
          toast.success(`Request successfully marked as ${status}`);
          handleOpenChange(false);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to review request");
        },
      },
    );
  };

  const actionTitles = {
    APPROVE: "Approve Request",
    REJECT: "Reject Request",
    ORDER: "Mark as Ordered",
    ARRIVED: "Mark as Arrived",
  };

  const actionDescriptions = {
    APPROVE: request.type === "withdrawal"
      ? "Select the location to withdraw items from and optionally add a note."
      : "Are you sure you want to approve this request? You can optionally add a note.",
    REJECT: "Please provide a reason for rejecting this request.",
    ORDER: "Enter the Purchase Order number and, if known, the expected arrival date.",
    ARRIVED: "Select the location where the items have been stored.",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        {request.status === "PENDING" && (
          <PermissionGuard permission={Permissions.requests.changeStatus}>
            <Button
              size="sm"
              variant="default"
              className="h-8 px-3 text-[12px] bg-primary hover:bg-primary/90"
              onClick={() => setAction("APPROVE")}
              disabled={isPending}
            >
              <PackageCheck className="mr-1.5 h-3.5 w-3.5" /> Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-[12px] text-destructive hover:text-destructive hover:bg-destructive/5"
              onClick={() => setAction("REJECT")}
              disabled={isPending}
            >
              Reject
            </Button>
          </PermissionGuard>
        )}
        {request.status === "APPROVED" && request.type !== "withdrawal" && (
          <PermissionGuard permission={Permissions.requests.changeStatus}>
            <Button
              size="sm"
              variant="default"
              className="h-8 px-3 text-[12px]"
              onClick={() => setAction("ORDER")}
              disabled={isPending}
            >
              <Send className="mr-1.5 h-3.5 w-3.5" /> Mark Ordered
            </Button>
          </PermissionGuard>
        )}
        {request.status === "ORDERED" && request.type !== "withdrawal" && (
          <PermissionGuard permission={Permissions.requests.changeStatus}>
            <Button
              size="sm"
              variant="default"
              className="h-8 px-3 text-[12px]"
              onClick={() => setAction("ARRIVED")}
              disabled={isPending}
            >
              <Truck className="mr-1.5 h-3.5 w-3.5" /> Mark Arrived
            </Button>
          </PermissionGuard>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setRequestId(request.id);
            }}
          >
            View Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={action !== null} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:min-w-[500px]">
          <DialogHeader>
            <DialogTitle>{action ? actionTitles[action] : ""}</DialogTitle>
            <DialogDescription>{action ? actionDescriptions[action] : ""}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 p-4">
            {action === "APPROVE" && request.type === "withdrawal" && (
              <div className="grid gap-2">
                <Label>Withdraw from Location <span className="text-destructive">*</span></Label>
                <LocationPicker value={locationId} onChange={setLocationId} />
              </div>
            )}

            {action === "ORDER" && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="poNumber">PO Number</Label>
                  <Input
                    id="poNumber"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    placeholder="e.g. PO-12345"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="orderEta" className="flex items-center gap-1">
                    Expected arrival (ETA)
                    <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
                  </Label>
                  <Input
                    id="orderEta"
                    type="date"
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                  />
                </div>
              </div>
            )}

            {action === "ARRIVED" && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Storage Location</Label>
                  <LocationPicker value={locationId} onChange={setLocationId} />
                </div>

                {!request.stockId && (
                  <div className="grid gap-4 mt-2 p-4 border rounded-md">
                    <p className="text-sm text-muted-foreground mb-2">
                      This request is for an item not yet in the system. Please map it.
                    </p>
                    <Tabs
                      value={assignType}
                      onValueChange={(v) => setAssignType(v as "existing" | "new")}
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="existing">Map to Existing</TabsTrigger>
                        <TabsTrigger value="new">Create New Stock</TabsTrigger>
                      </TabsList>
                      <TabsContent value="existing" className="mt-4">
                        <Label className="mb-2 block">Select Existing Stock</Label>
                        <StockPicker value={existingStockId} onChange={setExistingStockId} />
                      </TabsContent>
                      <TabsContent value="new" className="mt-4 space-y-4">
                        <div className="grid gap-2">
                          <Label>UOM (Unit of Measurement)</Label>
                          <Input
                            value={newStockUom}
                            onChange={(e) => setNewStockUom(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Type</Label>
                          <Select
                            value={newStockType}
                            onValueChange={(v) => setNewStockType(v as "mechanical" | "electrical")}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mechanical">Mechanical</SelectItem>
                              <SelectItem value="electrical">Electrical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Min Stock Level</Label>
                          <Input
                            type="number"
                            min="0"
                            value={newStockMinLevel}
                            onChange={(e) => setNewStockMinLevel(e.target.value)}
                            placeholder="0"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="adminNote">Admin Note</Label>
              <Textarea
                id="adminNote"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={5}
                className="min-h-40"
                placeholder={
                  action === "REJECT"
                    ? "Reason for rejection..."
                    : "Optional note to the requester..."
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              disabled={isPending}
              variant={action === "REJECT" ? "destructive" : "default"}
              onClick={onSubmit}
            >
              {isPending ? "Submitting..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { RequestRowActions };
