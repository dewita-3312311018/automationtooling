import { useQueryState, parseAsInteger } from "nuqs";
import { useAudits } from "./api/use-audits";
import { AuditTable } from "./components/audit-table";
import { auditColumns } from "./components/audit-columns";

function AuditPage() {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));
  const [perPage] = useQueryState("perPage", parseAsInteger.withDefault(10));
  const [search, setSearch] = useQueryState("search", {
    defaultValue: "",
    throttleMs: 400,
  });

  const { data, isLoading } = useAudits({ page, limit: perPage, search });

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-muted-foreground">Browse and search system activity history.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading ledger stream...</p>
          </div>
        </div>
      ) : (
        <AuditTable
          columns={auditColumns}
          data={data?.items || []}
          pageCount={data?.meta?.totalPages || -1}
          search={search}
          onSearchChange={setSearch}
        />
      )}
    </div>
  );
}

export { AuditPage };
