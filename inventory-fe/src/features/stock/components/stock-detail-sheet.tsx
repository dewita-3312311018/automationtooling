import { formatDate } from "@/lib/format";
import {
  History,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  Calendar,
  Layers,
  FileText
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useStock } from "../api/use-stock";
import { useStockLocations } from "../api/use-stock-locations";
import { TextCopy } from "@/components/ui/text-copy";

interface StockDetailSheetProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function StockDetailSheet({ id, open, onOpenChange }: StockDetailSheetProps) {
  const { data: stock, isLoading } = useStock({ id, enabled: open });
  const { data: locations, isLoading: isLocationsLoading } = useStockLocations({
    id,
    enabled: open,
  });

  const isLowStock = stock ? stock.quantity <= stock.minStockLevel : false;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[500px] overflow-y-auto p-0 border-l flex flex-col items-stretch">
        <SheetHeader className="p-6 space-y-1 bg-background/80 backdrop-blur-sm border-b sticky top-0 z-10">
          <div className="flex items-center justify-between w-full">
            <SheetTitle className="text-base">Stock Details</SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex-1">
          {isLoading || !stock ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-muted-foreground text-sm font-medium">Retrieving stock data...</span>
            </div>
          ) : (
            <div className="space-y-6 px-4 pt-0 pb-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 bg-muted/10 rounded-xl p-4 border">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Available Stock</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold tracking-tight">{stock.quantity}</span>
                      <span className="text-xs text-muted-foreground font-medium uppercase">{stock.uom}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Health Status</p>
                    <div>
                      {isLowStock ? (
                        <Badge variant="error" className="gap-1 px-2 py-0.5 text-xs">
                          <AlertCircle className="h-3 w-3" />
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="success" className="gap-1 px-2 py-0.5 text-xs">
                          <CheckCircle2 className="h-3 w-3" />
                          Healthy
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2 pt-2 mt-2 border-t border-dashed">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingDown className="h-3.5 w-3.5" />
                        <span>Stock Health Threshold</span>
                      </div>
                      <span className="font-medium">Min. Level: {stock.minStockLevel} {stock.uom}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 bg-muted/10 rounded-xl p-4 border">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Brand & Part</p>
                      <p className="font-medium text-sm">{stock.brand} {stock.modelNumber}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {stock.type}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {stock.description || "No specific description available for this item."}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-sm pt-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Layers className="h-3.5 w-3.5" />
                      <span>Project</span>
                    </div>
                    <span className="font-medium bg-primary/5 px-2 py-0.5 rounded text-primary text-xs">
                      {stock.projectType || "General Stock"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="divide-y border rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-3 text-sm hover:bg-muted/5 transition-colors">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5" />
                      Internal ID
                    </span>
                    <TextCopy text={stock.id} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {isLocationsLoading ? (
                  <div className="h-20 bg-muted/10 rounded-xl border border-dashed flex items-center justify-center">
                    <span className="text-xs text-muted-foreground italic animate-pulse">Locating stock limits...</span>
                  </div>
                ) : locations && locations.length > 0 ? (
                  <div className="grid gap-2">
                    {locations.map((loc) => (
                      <div
                        key={loc.locationId}
                        className="flex items-center justify-between border rounded-xl p-3.5 text-sm bg-background"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground/90">{loc.locationName}</span>
                          <span className="text-xs text-muted-foreground uppercase tracking-widest">{loc.floor || "Main Floor"}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-primary">{loc.quantity}</span>
                          <span className="text-xs text-muted-foreground ml-1.5 uppercase tracking-tighter">{stock.uom}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border border-dashed rounded-xl bg-orange-50/30 border-orange-200/50 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-orange-800/80 italic leading-snug">
                      This stock item is currently not mapped to any known warehouse location. Internal tracking may be required.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                  <History className="h-4 w-4" />
                  <h3>Timeline</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <p className="text-xs uppercase text-muted-foreground font-semibold flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Created
                    </p>
                    <p className="text-xs font-medium text-foreground/80">{formatDate(stock.createdAt, { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <div className="space-y-1.5 text-right">
                    <p className="text-xs uppercase text-muted-foreground font-semibold flex items-center justify-end gap-1">
                      <History className="h-3 w-3" />
                      Last Sync
                    </p>
                    <p className="text-xs font-medium text-foreground/80">{formatDate(stock.updatedAt, { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { StockDetailSheet };
export type { StockDetailSheetProps };
