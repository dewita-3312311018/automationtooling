import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { formatDate } from "@/lib/format";
import type { RequestInfo, RequestStatus } from "../types";
import { statusVariantMap, urgencyVariantMap } from "../types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useQueryState, parseAsString } from "nuqs";

function MyRequestRowActions({ request }: { request: RequestInfo }) {
  const [_, setRequestId] = useQueryState("requestId", parseAsString.withDefault(""));

  return (
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
        <DropdownMenuItem onClick={() => setRequestId(request.id)}>
          View Details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const myRequestColumns: ColumnDef<RequestInfo>[] = [
  {
    id: "modelNumber",
    accessorKey: "modelNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} label="Model Number" />,
    cell: ({ row }) => <span className="font-medium text-xs">{row.getValue("modelNumber")}</span>,
    enableSorting: false,
  },
  {
    id: "quantity",
    accessorKey: "quantity",
    header: ({ column }) => <DataTableColumnHeader column={column} label="Qty" />,
    enableSorting: false,
  },
  {
    id: "urgency",
    accessorKey: "urgency",
    header: ({ column }) => <DataTableColumnHeader column={column} label="Urgency" />,
    cell: ({ row }) => {
      const urgency = row.getValue<string>("urgency") || "normal";
      return (
        <Badge variant={urgencyVariantMap[urgency] ?? "secondary"} className="capitalize">
          {urgency}
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} label="Status" />,
    cell: ({ row }) => {
      const status = row.getValue<RequestStatus>("status");
      return (
        <Badge variant={statusVariantMap[status]} className="capitalize">
          {status.toLowerCase()}
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    id: "poNumber",
    accessorKey: "poNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} label="PO Number" />,
    cell: ({ row }) => {
      const po = row.getValue<string | null>("poNumber");
      return po ? (
        <span className="font-mono text-xs">{po}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
    enableSorting: false,
  },
  {
    id: "adminNote",
    accessorKey: "adminNote",
    header: ({ column }) => <DataTableColumnHeader column={column} label="Admin Note" />,
    cell: ({ row }) => {
      const note = row.getValue<string | null>("adminNote");
      return note ? (
        <span className="text-xs text-muted-foreground italic truncate max-w-[180px] block">{note}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
    enableSorting: false,
  },
  {
    id: "eta",
    accessorKey: "eta",
    header: ({ column }) => <DataTableColumnHeader column={column} label="ETA" />,
    cell: ({ row }) => <span className="text-xs">{formatDate(row.getValue<string>("eta"))}</span>,
    enableSorting: false,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} label="Submitted" />,
    cell: ({ row }) => <span className="text-xs">{formatDate(row.getValue<string>("createdAt"))}</span>,
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <MyRequestRowActions request={row.original} />,
    enableSorting: false,
  },
];

export { myRequestColumns };
