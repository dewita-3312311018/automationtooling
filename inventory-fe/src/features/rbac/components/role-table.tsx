import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { roleColumns } from "./role-columns";
import type { RoleInfo } from "@/features/staff/types";

interface RoleTableProps {
  data: RoleInfo[];
}

function RoleTable({ data }: RoleTableProps) {
  const { table } = useDataTable({
    data,
    columns: roleColumns,
    pageCount: 1,
    enableSorting: false,
  });

  return (
    <DataTable table={table} />
  );
}

export { RoleTable };
