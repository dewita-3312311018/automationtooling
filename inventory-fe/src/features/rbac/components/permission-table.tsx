import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { permissionColumns } from "./permission-columns";
import type { PermissionInfo } from "../api/use-permissions";

interface PermissionTableProps {
  data: PermissionInfo[];
}

function PermissionTable({ data }: PermissionTableProps) {
  const { table } = useDataTable({
    data,
    columns: permissionColumns,
    pageCount: 1,
  });

  return (
    <DataTable table={table} />
  );
}

export { PermissionTable };
