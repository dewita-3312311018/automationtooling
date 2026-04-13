import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import type { QueryKeys } from "@/types/data-table";
import { roleColumns } from "./role-columns";
import type { RoleInfo } from "@/features/staff/types";

interface RoleTableProps {
  data: RoleInfo[];
  pageCount: number;
  queryKeys?: Partial<QueryKeys>;
}

function RoleTable({ data, pageCount, queryKeys }: RoleTableProps) {
  const { table } = useDataTable({
    data,
    columns: roleColumns,
    pageCount,
    queryKeys,
    enableSorting: false,
  });

  return (
    <DataTable table={table} />
  );
}

export { RoleTable };
