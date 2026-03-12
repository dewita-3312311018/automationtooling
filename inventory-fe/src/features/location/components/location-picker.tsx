import * as React from "react";
import { useLocations } from "../api/use-locations";
import { useLocation } from "../api/use-location";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxValue,
} from "@/components/ui/combobox";
import { Loader2, MapPin } from "lucide-react";

interface LocationPickerProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function LocationPicker({ value, onChange, disabled }: LocationPickerProps) {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: locations, isLoading } = useLocations({
    search: debouncedSearch,
    limit: 10,
  });

  const { data: selectedLocation } = useLocation(value);

  const comboboxValue = React.useMemo(() => {
    if (!value) return null;
    return {
      value,
      label: selectedLocation?.name ?? "",
    };
  }, [value, selectedLocation]);

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
      <ComboboxInput placeholder="Search location..." disabled={disabled}>
        {!search && (
          <ComboboxValue placeholder="Select location">
            {() => selectedLocation?.name ?? null}
          </ComboboxValue>
        )}
      </ComboboxInput>
      <ComboboxContent>
        <ComboboxList>
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : locations?.items.length === 0 ? (
            <ComboboxEmpty>No locations found.</ComboboxEmpty>
          ) : (
            locations?.items.map((loc) => (
              <ComboboxItem key={loc.id} value={{ value: loc.id, label: loc.name }}>
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{loc.name}</span>
                  {loc.floor && (
                    <span className="text-xs text-muted-foreground">
                      Floor {loc.floor}
                    </span>
                  )}
                </div>
              </ComboboxItem>
            ))
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export { LocationPicker };
