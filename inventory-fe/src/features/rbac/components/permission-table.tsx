import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import type { QueryKeys } from "@/types/data-table";
import { permissionColumns } from "./permission-columns";
import type { PermissionInfo } from "../api/use-permissions";

interface PermissionTableProps {
  data: PermissionInfo[];
  pageCount: number;
  queryKeys?: Partial<QueryKeys>;
}

function PermissionTable({ data, pageCount, queryKeys }: PermissionTableProps) {
  const { table } = useDataTable({
    data,
    columns: permissionColumns,
    pageCount,
    queryKeys,
  });

  return (
    <DataTable table={table} />
  );
}

export { PermissionTable };
