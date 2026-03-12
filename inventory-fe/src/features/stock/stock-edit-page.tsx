import { useParams } from "@tanstack/react-router";
import { StockForm, useStock, useStockLocations } from "./";
import { Loader2 } from "lucide-react";

export function StockEditPage() {
  const { id } = useParams({ from: "/_authenticated/stock_/edit/$id" });
  const { data: stock, isLoading: isStockLoading } = useStock({ id });
  const { data: locationsResponse, isLoading: isLocationsLoading } = useStockLocations({ id });

  const isLoading = isStockLoading || isLocationsLoading;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-semibold text-destructive">Stock not found</h2>
        <p className="text-muted-foreground mt-2">The requested stock item could not be found.</p>
      </div>
    );
  }

  const stockWithLocations = {
    ...stock,
    locations: locationsResponse?.map(loc => ({
      locationId: loc.locationId,
      quantity: loc.quantity
    })) || []
  };

  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="mx-auto max-w-4xl">
        <StockForm initialData={stockWithLocations} />
      </div>
    </div>
  );
}


