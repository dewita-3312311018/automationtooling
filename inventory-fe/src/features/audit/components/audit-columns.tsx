import { type ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { AuditInfo } from "../types";

function AuditDetailCell({ details }: { details: string | null }) {
  if (!details) return <span className="text-muted-foreground">-</span>;

  return (
    <div className="flex items-center gap-2">
      <span
        className="text-xs max-w-[400px] block line-clamp-1 text-ellipsis"
        dangerouslySetInnerHTML={{ __html: details }}
      />
      <Dialog>
        <DialogTrigger
          render={
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              Show more
            </Button>
          }
        />
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Details</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <div
              className="text-sm"
              dangerouslySetInnerHTML={{ __html: details }}
            />
          </div>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline" size="sm">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>


      </Dialog>
    </div>
  );
}

const auditColumns: ColumnDef<AuditInfo>[] = [
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} label="Timestamp" />,
    cell: ({ row }) => <span className="text-xs">{formatDate(row.getValue<string>("createdAt"), { hour: "2-digit", minute: "2-digit" })}</span>,
  },
  {
    id: "actor",
    accessorKey: "userId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Actor" label="Actor" />,
    cell: ({ row }) => {
      const userName = row.original.userName;
      return <span className="text-xs">{userName || "System"}</span>;
    },
  },
  {
    id: "action",
    accessorKey: "action",
    header: ({ column }) => <DataTableColumnHeader column={column} label="Action" />,
    cell: ({ row }) => {
      const action = row.getValue<string>("action");

      let variant: "default" | "destructive" | "secondary" | "outline" = "default";
      if (action === "DELETE") variant = "destructive";
      if (action === "CREATE") variant = "default";
      if (action === "UPDATE") variant = "outline";

      return (
        <Badge variant={variant} className="capitalize py-0.5">
          {action.toLowerCase()}
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    id: "entity",
    accessorKey: "entity",
    header: ({ column }) => <DataTableColumnHeader column={column} label="Entity" />,
    cell: ({ row }) => {
      return <span className="text-xs font-medium">{row.getValue<string>("entity")}</span>;
    },
    enableSorting: false,
  },
  {
    id: "details",
    accessorKey: "details",
    header: ({ column }) => <DataTableColumnHeader column={column} label="Details" />,
    cell: ({ row }) => <AuditDetailCell details={row.getValue<string | null>("details")} />,
    enableSorting: false,
  },
];

export { auditColumns };
