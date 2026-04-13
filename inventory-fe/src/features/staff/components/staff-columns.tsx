import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { StaffRowActions } from "./staff-row-actions";
import { formatDate } from "@/lib/format";
import type { UserInfo } from "../types";

const staffColumns: ColumnDef<UserInfo>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} label="Name" />,
    cell: ({ row }) => <span className="text-xs">{row.getValue("name")}</span>,
    enableSorting: false,
  },
  {
    id: "username",
    accessorKey: "username",
    header: ({ column }) => <DataTableColumnHeader column={column} label="Username" />,
    cell: ({ row }) => <span className="text-xs">{row.getValue("username")}</span>,
    enableSorting: false,
  },
  {
    id: "role",
    accessorKey: "role",
    header: ({ column }) => <DataTableColumnHeader column={column} label="Role" />,
    cell: ({ row }) => {
      const role = row.getValue<string | undefined>("role");
      if (!role) {
        return <span className="italic text-xs">Unassigned</span>;
      }
      return (
        <Badge variant="secondary" className="capitalize">
          {role.toLowerCase()}
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} label="Created At" />,
    cell: ({ row }) => <span className="text-xs">{formatDate(row.getValue<string>("createdAt"))}</span>,
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <StaffRowActions user={row.original} />,
    enableSorting: false,
  },
];

export { staffColumns };
