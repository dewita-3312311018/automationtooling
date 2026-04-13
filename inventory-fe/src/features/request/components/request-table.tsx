import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RequestType } from "../types";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  search?: string;
  onSearchChange?: (value: string) => void;
  typeFilter?: RequestType | "all";
  onTypeFilterChange?: (value: RequestType | "all") => void;
}

function RequestTable<TData, TValue>({
  columns,
  data,
  pageCount,
  search = "",
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
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

  const handleSearch = (val: string) => {
    setInputValue(val);
    debouncedSearch(val);
  };

  return (
    <div className="space-y-4">
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <Input
            placeholder="Search requests..."
            value={inputValue}
            onChange={(event) => handleSearch(event.target.value)}
            className="h-8 w-40 lg:w-64"
          />
          {onTypeFilterChange && (
            <Select
              value={typeFilter || "all"}
              onValueChange={(val) => onTypeFilterChange(val as RequestType | "all")}
            >
              <SelectTrigger className="h-8 w-[150px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="procurement">Procurement</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
              </SelectContent>
            </Select>
          )}
        </DataTableToolbar>
      </DataTable>
    </div>
  );
}

export { RequestTable };
