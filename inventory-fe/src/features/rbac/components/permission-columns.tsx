import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { PermissionRowActions } from "./permission-row-actions.tsx";
import type { PermissionInfo } from "../api/use-permissions";

const permissionColumns: ColumnDef<PermissionInfo>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" label="Name" />,
    cell: ({ row }) => <span className="font-medium text-xs">{row.getValue("name")}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" label="Description" />,
    cell: ({ row }) => <span className="text-xs truncate max-w-[300px] block">{row.getValue("description") || "-"}</span>,
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" label="Created At" />,
    cell: ({ row }) => (
      <span className="text-xs">
        {formatDate(row.getValue("createdAt"))}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <PermissionRowActions row={row} />,
    enableSorting: false,
  },
];

export { permissionColumns };
