import { useState, isValidElement } from "react";
import { Plus, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useCreateRequest } from "../api/use-create-request";
import { toast } from "sonner";
import type { RequestUrgency } from "../types";
import { Slot } from "@radix-ui/react-slot";

interface CreateRequestDialogProps {
  stockId: string;
  stockName?: string;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function CreateRequestDialog({
  stockId,
  stockName,
  children,
  open: controlledOpen,
  onOpenChange: setControlledOpen
}: CreateRequestDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled && setControlledOpen ? setControlledOpen : setUncontrolledOpen;
  const [quantity, setQuantity] = useState<number | "">("");
  const [urgency, setUrgency] = useState<RequestUrgency>("normal");
  const [note, setNote] = useState("");
  const [eta, setEta] = useState("");

  const { mutate, isPending } = useCreateRequest();

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setQuantity("");
      setUrgency("normal");
      setNote("");
      setEta("");
    }
    setOpen(newOpen);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!quantity || quantity <= 0) {
      toast.error("Please enter a valid quantity.");
      return;
    }

    mutate(
      {
        stockId,
        quantity: Number(quantity),
        urgency,
        note: note || undefined,
        eta: eta || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Request submitted successfully!");
          handleOpenChange(false);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to submit request.");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {(!isControlled || children) && (
        <DialogTrigger
          render={
            children ? (
              isValidElement(children) ? children : <Slot>{children}</Slot>
            ) : (
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Plus className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Request Item
                </span>
              </Button>
            )
          }
        />
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit Request</DialogTitle>
          <DialogDescription>
            Submit a formal request for {stockName ? <span className="font-medium text-foreground">{stockName}</span> : "this item"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} id="request-form" className="p-4">
          <div className="grid gap-4 p-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                required
                className="col-span-3"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : "")}
                placeholder="Amount needed"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="urgency" className="text-right">
                Urgency
              </Label>
              <Select
                value={urgency}
                onValueChange={(val) => setUrgency(val as RequestUrgency)}
              >
                <SelectTrigger className="col-span-3 w-full" id="urgency" type="button">
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="eta" className="text-right flex items-center justify-end gap-1.5">
                <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                ETA
              </Label>
              <Input
                id="eta"
                type="date"
                className="col-span-3 w-full"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="note" className="text-right pt-2.5">
                Note
              </Label>
              <Textarea
                id="note"
                className="col-span-3"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Why is this part needed? (Optional)"
                rows={3}
              />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} form="request-form">
            {isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { CreateRequestDialog };
