import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { Input } from "@/components/ui/input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount?: number;
  search?: string;
  onSearchChange?: (value: string) => void;
}

function StaffTable<TData, TValue>({
  columns,
  data,
  pageCount = 1,
  search = "",
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

  const debouncedSearch = useDebouncedCallback((val: string) => onSearchChange?.(val), 500);

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
            placeholder="Search staff..."
            value={inputValue}
            onChange={(event) => handleSearch(event.target.value)}
            className="h-8 w-40 lg:w-64"
          />
        </DataTableToolbar>
      </DataTable>
    </div>
  );
}

export { StaffTable };
