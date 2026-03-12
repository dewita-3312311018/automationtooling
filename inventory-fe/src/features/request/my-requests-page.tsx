import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { Link } from "@tanstack/react-router";
import {
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMyRequests } from "./api";
import { RequestTable, RequestDetailSheet } from "./components";
import { myRequestColumns } from "./components/my-request-columns";

export function MyRequestsPage() {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit] = useQueryState("perPage", parseAsInteger.withDefault(10));
  const [requestId, setRequestId] = useQueryState("requestId", parseAsString.withDefault(""));
  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
    throttleMs: 400,
  });

  const { data: requestResponse, isLoading } = useMyRequests({
    page,
    limit,
    search: search || undefined,
  });

  const currentItems = requestResponse?.items || [];

  return (
    <div className="flex-1 space-y-8">
      <RequestDetailSheet
        id={requestId}
        open={!!requestId}
        onOpenChange={(open) => !open && setRequestId(null)}
      />

      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Requests</h2>
          <p className="text-muted-foreground">
            Track the status of all your inventory requests.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link to="/requests/create">
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading your requests...</p>
          </div>
        </div>
      ) : (
        <RequestTable
          columns={myRequestColumns}
          data={currentItems}
          pageCount={requestResponse?.meta?.totalPages || -1}
          search={search}
          onSearchChange={setSearch}
        />
      )}
    </div>
  );
}
