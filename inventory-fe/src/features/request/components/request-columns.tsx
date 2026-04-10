import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { RequestRowActions } from "./request-row-actions";
import { formatDate } from "@/lib/format";
import type { RequestInfo, RequestStatus } from "../types";
import { statusVariantMap, urgencyVariantMap } from "../types";


const requestColumns: ColumnDef<RequestInfo>[] = [
  {
    id: "modelNumber",
    accessorFn: (row) => row.modelNumber ?? row.requestedModelNumber ?? "—",
    header: ({ column }) => <DataTableColumnHeader column={column} label="Model Number" />,
    cell: ({ row }) => (
      <span className="font-medium text-xs">{String(row.getValue("modelNumber"))}</span>
    ),
    enableSorting: false,
  },
  {
    id: "requester",
    accessorFn: (row) => row.requester?.name,
    header: ({ column }) => <DataTableColumnHeader column={column} label="Requester" />,
    cell: ({ row }) => <span className="font-medium text-xs">{row.getValue("requester") || "—"}</span>,
    enableSorting: false,
  },
  {
    id: "quantity",
    accessorKey: "quantity",
    header: ({ column }) => <DataTableColumnHeader column={column} label="Quantity" />,
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
    id: "eta",
    accessorKey: "eta",
    header: ({ column }) => <DataTableColumnHeader column={column} label="ETA" />,
    cell: ({ row }) => <span className="text-xs">{formatDate(row.getValue<string>("eta"))}</span>,
    enableSorting: false,
  },
  {
    id: "updatedAt",
    accessorKey: "updatedAt",
    header: ({ column }) => <DataTableColumnHeader column={column} label="Last Updated" />,
    cell: ({ row }) => <span className="text-xs">{formatDate(row.getValue<string>("updatedAt"))}</span>,
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <RequestRowActions request={row.original} />;
    },
    enableSorting: false,
  },

];

export { requestColumns };
