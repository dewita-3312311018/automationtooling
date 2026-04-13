import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { Input } from "@/components/ui/input";

import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  search: string;
  onSearchChange: (value: string) => void;
}

function AuditTable<TData, TValue>({
  columns,
  data,
  pageCount,
  search,
  onSearchChange,
}: DataTableProps<TData, TValue>) {
  const [inputValue, setInputValue] = React.useState(search);

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  const debouncedSearch = useDebouncedCallback(onSearchChange, 500);

  // Sync internal state with external search prop
  React.useEffect(() => {
    setInputValue(search);
  }, [search]);

  const handleSearch = (val: string) => {
    setInputValue(val);
    debouncedSearch(val);
  };

  return (
    <div className="space-y-4">
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <Input
            placeholder="Search logs..."
            value={inputValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-8 w-40 lg:w-64"
          />
        </DataTableToolbar>
      </DataTable>
    </div>
  );
}

export { AuditTable };
