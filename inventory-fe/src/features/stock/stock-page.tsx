import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Plus, PackageOpen, AlertTriangle, ScrollText, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStocks, useStockSummary } from "./api";
import { stockColumns, StockTable, StockDetailSheet } from "./components";
import { PermissionGuard } from "../rbac/components/permission-guard";
import { Permissions } from "../rbac/utils/permission-constants";

export function StockPage() {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [perPage] = useQueryState("perPage", parseAsInteger.withDefault(10));
  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
    throttleMs: 400,
  });
  const [stockId, setStockId] = useQueryState("stockId", parseAsString.withDefault(""));

  const { data: stockResponse, isLoading } = useStocks({
    page,
    limit: perPage,
    search: search || undefined,
  });

  const { data: summary } = useStockSummary();

  const currentItems = stockResponse?.items || [];
  const totalStocks = summary?.totalStocks || 0;
  const totalLowStock = summary?.lowStockAlerts || 0;
  const totalMechElec = summary?.technicalItems || 0;
  const totalRequested = summary?.pendingRequests || 0;

  return (
    <div className="flex-1 space-y-8">
      <StockDetailSheet
        id={stockId}
        open={!!stockId}
        onOpenChange={(open) => !open && setStockId(null)}
      />

      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Stock Inventory</h2>
          <p className="text-muted-foreground">Manage and track your inventory stock levels.</p>
        </div>
        <div className="flex items-center space-x-2">
          <PermissionGuard permission={Permissions.stocks.create}>
            <Button asChild>
              <Link to="/stock/create">
                <Plus className="mr-2 h-4 w-4" />
                Create New Stock
              </Link>
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stocks</CardTitle>
            <div className="rounded-md bg-blue-100 p-2.5 dark:bg-blue-900/40">
              <PackageOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStocks}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>
        <Card className="transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <div className="rounded-md bg-amber-100 p-2.5 dark:bg-amber-900/40">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {totalLowStock}
            </div>
            <p className="text-xs text-muted-foreground">Items requiring restock</p>
          </CardContent>
        </Card>
        <Card className="transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <div className="rounded-md bg-emerald-100 p-2.5 dark:bg-emerald-900/40">
              <ScrollText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRequested}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card className="transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Technical items</CardTitle>
            <div className="rounded-md bg-purple-100 p-2.5 dark:bg-purple-900/40">
              <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalMechElec}</div>
            <p className="text-xs text-muted-foreground">Mechanical & Electrical</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading inventory data...</p>
          </div>
        </div>
      ) : (
        <StockTable
          columns={stockColumns}
          data={currentItems}
          pageCount={stockResponse?.meta?.totalPages || -1}
          search={search}
          onSearchChange={setSearch}
        />
      )}
    </div>
  );
}


