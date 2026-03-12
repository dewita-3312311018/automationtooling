import React from "react";
import { useUserPermissions } from "../hooks/use-user-permissions";

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
}

function PermissionGuard({ permission, children }: PermissionGuardProps) {
  const { hasPermission, isLoading } = useUserPermissions();

  if (isLoading) {
    return null;
  }

  if (!hasPermission(permission)) {
    return null;
  }

  return <>{children}</>;
}

export { PermissionGuard };
