import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { StockInfo } from "../types";
import { StockRowActions } from "./stock-row-actions";

const stockColumns: ColumnDef<StockInfo>[] = [
  {
    id: "modelNumber",
    accessorKey: "modelNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Model Number" label="Model Number" />
    ),
    cell: ({ row }) => <span className="text-xs">{row.getValue("modelNumber")}</span>,
    enableSorting: false,
  },
  {
    id: "description",
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" label="Description" />
    ),
    cell: ({ row }) => <span className="text-xs">{row.getValue("description")}</span>,
    enableSorting: false,
  },
  {
    id: "brand",
    accessorKey: "brand",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Brand" label="Brand" />,
    cell: ({ row }) => <span className="text-xs">{row.getValue("brand")}</span>,
    enableSorting: false,
  },
  {
    id: "quantity",
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quantity" label="Quantity" />
    ),
    cell: ({ row }) => {
      const qty = row.getValue<number>("quantity");
      const minStock = row.original.minStockLevel;
      const isLow = qty <= minStock;
      return <span className={isLow ? "text-destructive font-semibold text-xs" : "text-xs"}>{qty}</span>;
    },
    enableSorting: false,
  },
  {
    id: "uom",
    accessorKey: "uom",
    header: ({ column }) => <DataTableColumnHeader column={column} title="UoM" label="UoM" />,
    enableSorting: false,
  },
  {
    id: "type",
    accessorKey: "type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" label="Type" />,
    cell: ({ row }) => {
      const type = row.getValue<string>("type");
      return (
        <Badge
          variant={type === "electrical" ? "default" : "secondary"}
          className="capitalize shadow-none"
        >
          {type}
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    id: "actions",
    cell: ({ row }) => <StockRowActions stock={row.original} />,
    enableSorting: false,
  },
];

export { stockColumns };
