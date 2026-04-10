import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import { QrCode } from "lucide-react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { LocationRowActions } from "./location-row-actions";
import type { LocationInfo } from "../api/use-locations";

const locationColumns: ColumnDef<LocationInfo>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" label="Name" />,
    cell: ({ row }) => <span className="font-medium text-xs">{row.getValue("name")}</span>,
    enableHiding: false,
  },
  {
    accessorKey: "floor",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Floor" label="Floor" />,
    cell: ({ row }) => <span className="text-xs">{row.getValue("floor") || "N/A"}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" label="Description" />,
    cell: ({ row }) => (
      <span className="line-clamp-1 text-xs">
        {row.getValue("description") || "-"}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "qrCode",
    header: "QR Code",
    cell: ({ row, table }) => {
      return (
        <Button
          variant="outline"
          size="xs"
          className="h-8 gap-2"
          onClick={() => {
            const meta = table.options.meta as any;
            meta?.onShowQr(row.original);
          }}
        >
          <QrCode className="h-4 w-4" />
          Show QR
        </Button>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Updated" label="Last Updated" />,
    cell: ({ row }) => (
      <span className="text-xs">
        {formatDate(row.getValue("updatedAt"))}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <LocationRowActions location={row.original} />,
    enableSorting: false,
  },
];

export { locationColumns };
export type { LocationInfo }; // Ensure LocationInfo is available if needed elsewhere
