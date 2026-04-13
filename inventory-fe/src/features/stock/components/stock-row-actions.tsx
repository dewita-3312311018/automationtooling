import { Link } from "@tanstack/react-router";
import { useQueryState, parseAsString } from "nuqs";
import { Edit, Eye, MoreHorizontal, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/features/rbac/components/permission-guard";
import { CreateRequestDialog } from "@/features/request/components/create-request-dialog";
import { Permissions } from "@/features/rbac/utils/permission-constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { StockInfo } from "../types";
import { useDeleteStock } from "../api";
import { useState } from "react";
import { toast } from "sonner";

interface StockRowActionsProps {
  stock: StockInfo;
}

function StockRowActions({ stock }: StockRowActionsProps) {
  const [_, setStockId] = useQueryState("stockId", parseAsString);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteMutation = useDeleteStock();

  const handleDelete = () => {
    deleteMutation.mutate(stock.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        toast.success(`Stock ${stock.modelNumber} deleted successfully`);
      },
      onError: () => {
        toast.error("Failed to delete stock");
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <PermissionGuard permission={Permissions.stocks.update}>
            <DropdownMenuItem asChild>
              <Link
                to="/stock/edit/$id"
                params={{ id: stock.id }}
                className="flex w-full items-center"
              >
                <Edit className="mr-2 h-4 w-4" />
                Update
              </Link>
            </DropdownMenuItem>
          </PermissionGuard>
          <DropdownMenuItem onSelect={() => setIsRequestDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Request Item
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setStockId(stock.id)}>
            <Eye className="mr-2 h-4 w-4" />
            Detail
          </DropdownMenuItem>
          <PermissionGuard permission={Permissions.stocks.delete}>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </PermissionGuard>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateRequestDialog
        stockId={stock.id}
        stockName={`${stock.brand} ${stock.modelNumber}`}
        open={isRequestDialogOpen}
        onOpenChange={setIsRequestDialogOpen}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the stock
              item <span className="font-semibold">{stock.modelNumber}</span> ({stock.brand}) from the
              inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export { StockRowActions };
