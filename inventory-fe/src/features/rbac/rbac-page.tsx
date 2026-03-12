import { useState } from "react";
import { Plus, Shield, Key } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RoleTable } from "./components/role-table";
import { PermissionTable } from "./components/permission-table";
import { RoleDialog } from "./components/role-dialog";
import { PermissionDialog } from "./components/permission-dialog";
import { useRoles } from "@/features/rbac/api/use-roles";
import { usePermissions } from "./api/use-permissions";

function RBACPage() {
  const [activeTab, setActiveTab] = useState<string>("roles");
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);

  const { data: roles, isLoading: isLoadingRoles } = useRoles();
  const { data: permissions, isLoading: isLoadingPermissions } = usePermissions();

  const isLoading = isLoadingRoles || isLoadingPermissions;

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Access Control</h2>
          <p className="text-muted-foreground">
            Manage system roles and their associated permissions.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {activeTab === "roles" ? (
            <Button onClick={() => setIsRoleDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Role
            </Button>
          ) : (
            <Button onClick={() => setIsPermissionDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Permission
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="h-4 w-4" /> Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <RoleTable data={roles?.items || []} />
          )}
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <PermissionTable data={permissions?.items || []} />
          )}
        </TabsContent>
      </Tabs>

      <RoleDialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen} />
      <PermissionDialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen} />
    </div>
  );
}

export { RBACPage };
