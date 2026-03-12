import * as React from "react";
import { useStocks } from "../api/use-stocks";
import { useStock } from "../api/use-stock";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxValue
} from "@/components/ui/combobox";
import { Loader2, Package } from "lucide-react";

interface StockPickerProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function StockPicker({ value, onChange, disabled }: StockPickerProps) {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: stocks, isLoading } = useStocks({
    search: debouncedSearch,
    limit: 10,
  });

  const { data: selectedStock } = useStock({
    id: value || "",
    enabled: !!value,
  });

  const comboboxValue = React.useMemo(() => {
    if (!value) return null;
    const label = selectedStock ? `${selectedStock.brand} ${selectedStock.modelNumber}` : "";
    return {
      value,
      label,
    };
  }, [value, selectedStock]);

  return (
    <Combobox
      value={comboboxValue}
      onValueChange={(val: { value: string; label: string } | null) => {
        if (val) {
          onChange(val.value);
        }
      }}
      isItemEqualToValue={(item, val) => item?.value === val?.value}
      inputValue={search}
      onInputValueChange={setSearch}
      disabled={disabled}
    >
      <ComboboxInput
        placeholder="Search stock by brand or model..."
        disabled={disabled}
      >
        {!search && (
          <ComboboxValue placeholder="Select stock item">
            {() => (selectedStock ? `${selectedStock.brand} ${selectedStock.modelNumber}` : null)}
          </ComboboxValue>
        )}
      </ComboboxInput>
      <ComboboxContent>
        <ComboboxList>
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : stocks?.items.length === 0 ? (
            <ComboboxEmpty>No stocks found.</ComboboxEmpty>
          ) : (
            stocks?.items.map((stock) => (
              <ComboboxItem
                key={stock.id}
                value={{ value: stock.id, label: `${stock.brand} ${stock.modelNumber}` }}
              >
                <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{stock.brand} {stock.modelNumber}</span>
                  <span className="text-xs text-muted-foreground">
                    Available: {stock.quantity} {stock.uom}
                  </span>
                </div>
              </ComboboxItem>
            ))
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export { StockPicker };
