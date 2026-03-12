import { useQueryState, parseAsInteger } from "nuqs";
import { useUsers } from "./api";
import { StaffTable, staffColumns, CreateUserDialog } from "./components";

export function StaffPage() {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [perPage] = useQueryState("perPage", parseAsInteger.withDefault(10));
  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
    throttleMs: 400,
  });

  const { data: users, isLoading } = useUsers({
    page,
    limit: perPage,
    search: search || undefined,
  });

  const items = users?.items || [];

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Staff Management</h2>
          <p className="text-muted-foreground">Manage and track user accounts and permissions.</p>
        </div>
        <div className="flex items-center space-x-2">
          <CreateUserDialog />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading staff data...</p>
          </div>
        </div>
      ) : (
        <StaffTable
          columns={staffColumns}
          data={items}
          pageCount={users?.meta?.totalPages || 1}
          search={search}
          onSearchChange={setSearch}
        />
      )}
    </div>
  );
}
