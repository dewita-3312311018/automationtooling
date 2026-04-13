import { useMemo } from "react";
import { useMyPermissions } from "../api/use-my-permissions";

function useUserPermissions() {
  const { data, isLoading } = useMyPermissions();

  const permissions = data?.permissions || [];

  const hasPermission = useMemo(() => {
    return (permission: string) => {
      return permissions.includes(permission);
    };
  }, [permissions]);

  return {
    permissions,
    hasPermission,
    isLoading,
  };
}

export { useUserPermissions };
