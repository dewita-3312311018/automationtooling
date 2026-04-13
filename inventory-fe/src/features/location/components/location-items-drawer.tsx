import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Package, Boxes, Loader2 } from "lucide-react";
import { useLocationStocks } from "../api/use-location-stocks";

interface LocationItemsDrawerProps {
  locationId: string | null;
  onClose: () => void;
}

function LocationItemsDrawer({ locationId, onClose }: LocationItemsDrawerProps) {
  const { data, isLoading } = useLocationStocks(locationId);

  return (
    <Sheet open={!!locationId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] px-4">
        <SheetHeader className="pb-6 border-b">
          <SheetTitle className="flex items-center gap-2 text-xl">
            Items in Location
          </SheetTitle>
          <SheetDescription>
            {data?.location?.name ? `Stored in ${data.location.name}` : "Loading location details..."}
            {data?.location?.floor && ` • Floor ${data.location.floor}`}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Fetching items...</p>
            </div>
          ) : data?.stocks && data.stocks.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-180px)] pr-4">
              <div className="space-y-4">
                {data.stocks.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm transition-all hover:border-primary/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-foreground leading-none">
                          {item.modelNumber}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {item.brand}
                        </p>
                      </div>
                      <Badge variant={item.type === "mechanical" ? "outline" : "secondary"}>
                        {item.type}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {item.quantity} {item.uom}
                        </span>
                      </div>
                      {item.quantity <= item.minStockLevel && (
                        <Badge variant="destructive" className="text-[10px] h-5">
                          Low Stock
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex h-[300px] flex-col items-center justify-center gap-3 text-center opacity-60">
              <div className="rounded-full bg-muted p-4">
                <Boxes className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">No items found</p>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                  This location is currently empty or has no assigned stock.
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { LocationItemsDrawer };
