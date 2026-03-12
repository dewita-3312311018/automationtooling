import { useParams, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { $fetch } from "@/config/fetch";
import { Boxes, Package, MapPin, ArrowLeft, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { StockInfo } from "../stock/types";
import type { LocationInfo } from "./api/use-locations";

type PublicLocationResponse = {
  data: {
    location: LocationInfo;
    stocks: StockInfo[];
  };
};

function PublicLocationPage() {
  const { id } = useParams({ from: "/public/location/$id" });

  const { data, isLoading, error } = useQuery({
    queryKey: ["public", "locations", id, "stocks"],
    queryFn: async () => {
      // Note: Even though it's a public route on the router, 
      // the backend endpoint is /public/locations/:id/stocks
      const { data, error } = await $fetch<PublicLocationResponse>(`/public/locations/${id}/stocks`);
      if (error) throw error;
      return data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30 p-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Fetching location inventory...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30 p-6 text-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <MapPin className="h-10 w-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold">Location Not Found</h1>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            The storage zone you scanned could not be located or may have been removed.
          </p>
        </div>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  const { location, stocks } = data;

  return (
    <div className="min-h-screen bg-muted/30 pb-10">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">{location.name}</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Inventory Check
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </header>

      <main className="container max-w-2xl px-4 pt-6 space-y-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Location Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                  Floor
                </span>
                <p className="text-sm font-semibold">{location.floor || "N/A"}</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                  Total Items
                </span>
                <p className="text-sm font-semibold">{stocks.length}</p>
              </div>
            </div>
            {location.description && (
              <>
                <Separator />
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    Description
                  </span>
                  <p className="text-sm text-muted-foreground italic">
                    {location.description}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              Stored Inventory
              <Badge variant="outline" className="h-5 px-1.5 ml-1">
                {stocks.length}
              </Badge>
            </h3>
          </div>

          {stocks.length === 0 ? (
            <Card className="border-dashed py-12">
              <CardContent className="flex flex-col items-center justify-center text-center space-y-3">
                <Package className="h-10 w-10 text-muted-foreground opacity-20" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">No items found</p>
                  <p className="text-xs text-muted-foreground">
                    This location is currently empty.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {stocks.map((item) => (
                <Card key={item.id} className="overflow-hidden border-none shadow-sm transition-active hover:shadow-md">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-bold text-base leading-none">
                          {item.modelNumber}
                        </h4>
                        <p className="text-xs font-semibold text-primary">
                          {item.brand}
                        </p>
                      </div>
                      <Badge variant={item.type === "mechanical" ? "secondary" : "default"} className="text-[10px] h-5 uppercase tracking-tighter">
                        {item.type}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <div className="bg-muted rounded px-2 py-1 flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-bold">
                            {item.quantity} {item.uom}
                          </span>
                        </div>
                      </div>
                      {item.quantity <= item.minStockLevel && (
                        <Badge variant="destructive" className="h-5 text-[9px] font-bold">
                          REFILL REQUIRED
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export { PublicLocationPage };
