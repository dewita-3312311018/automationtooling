import * as React from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { Input } from "@/components/ui/input";
import { locationColumns } from "./location-columns";
import { LocationQrDialog } from "./location-qr-dialog";
import type { LocationInfo } from "../api/use-locations";

import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import type { QueryKeys } from "@/types/data-table";

interface LocationTableProps {
  data: LocationInfo[];
  pageCount: number;
  search: string;
  onSearchChange: (value: string) => void;
}

function LocationTable({ data, pageCount, search, onSearchChange }: LocationTableProps) {
  const [qrLocation, setQrLocation] = React.useState<LocationInfo | null>(null);
  const [inputValue, setInputValue] = React.useState(search);

  const { table } = useDataTable({
    data,
    columns: locationColumns,
    pageCount,
    queryKeys: { perPage: "limit" } satisfies Partial<QueryKeys>,
    meta: {
      onShowQr: (location: LocationInfo) => setQrLocation(location),
    } as any,
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
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <Input
            placeholder="Search locations..."
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
            className="h-8 w-40 lg:w-64"
          />
        </DataTableToolbar>
      </DataTable>

      <LocationQrDialog
        location={qrLocation}
        open={!!qrLocation}
        onOpenChange={(open) => !open && setQrLocation(null)}
      />
    </>
  );
}

export { LocationTable };
