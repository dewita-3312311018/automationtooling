import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { Link } from "@tanstack/react-router";
import { ClipboardList, Clock, CheckCircle, XCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRequests } from "./api";
import { RequestTable, requestColumns, RequestDetailSheet } from "./components";
import { PermissionGuard } from "../rbac/components/permission-guard";
import { Permissions } from "../rbac/utils/permission-constants";

export function RequestPage() {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit] = useQueryState("perPage", parseAsInteger.withDefault(10));
  const [requestId, setRequestId] = useQueryState("requestId", parseAsString.withDefault(""));
  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
    throttleMs: 400,
  });

  const { data: requestResponse, isLoading } = useRequests({
    page,
    limit,
    search: search || undefined,
  });

  const currentItems = requestResponse?.items || [];
  const totalRequests = requestResponse?.meta?.total || 0;
  const pendingCount = currentItems.filter((r) => r.status === "PENDING").length;
  const approvedCount = currentItems.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = currentItems.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="flex-1 space-y-8">
      <RequestDetailSheet
        id={requestId}
        open={!!requestId}
        onOpenChange={(open) => !open && setRequestId(null)}
      />

      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Requests Parts</h2>
          <p className="text-muted-foreground">
            Manage and track your inventory procurement requests.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <PermissionGuard permission={Permissions.requests.create}>
            <Button asChild>
              <Link to="/requests/create">
                <Plus className="mr-2 h-4 w-4" />
                Create New Request 
              </Link>
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <div className="rounded-md bg-blue-100 p-2.5 dark:bg-blue-900/40">
              <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">All submitted requests</p>
          </CardContent>
        </Card>
        <Card className="transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <div className="rounded-md bg-amber-100 p-2.5 dark:bg-amber-900/40">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {pendingCount}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card className="transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <div className="rounded-md bg-emerald-100 p-2.5 dark:bg-emerald-900/40">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {approvedCount}
            </div>
            <p className="text-xs text-muted-foreground">Ready for procurement</p>
          </CardContent>
        </Card>
        <Card className="transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <div className="rounded-md bg-red-100 p-2.5 dark:bg-red-900/40">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">Declined by admin</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading requests...</p>
          </div>
        </div>
      ) : (
        <RequestTable
          columns={requestColumns}
          data={currentItems}
          pageCount={requestResponse?.meta?.totalPages || -1}
          search={search}
          onSearchChange={setSearch}
        />
      )}
    </div>
  );
}
