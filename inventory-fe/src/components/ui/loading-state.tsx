import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingState({ message = "Loading...", size = "md", className = "" }: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`flex h-full items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={`animate-spin text-muted-foreground ${sizeClasses[size]}`} />
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}

export function TableLoadingState() {
  return (
    <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed">
      <LoadingState message="Loading data..." />
    </div>
  );
}

export function InlineLoadingState({ message }: { message?: string }) {
  return <LoadingState message={message} size="sm" />;
}
