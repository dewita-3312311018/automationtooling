import { ShieldAlert } from "lucide-react";

function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="mb-6 rounded-full bg-destructive/10 p-6">
        <ShieldAlert className="h-10 w-10 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
        Access Denied
      </h1>
      <p className="text-muted-foreground max-w-md mb-8">
        You don't have permission to access this page. Please contact your administrator if you believe this is an error.
      </p>
    </div>
  );
}

export { ForbiddenPage };
