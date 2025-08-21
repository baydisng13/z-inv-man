
"use client";

import { ColumnDef } from "@tanstack/react-table";

import { CellAction } from "./cell-action";
import { Sale } from "@/schemas/sale-schema";

export const columns: ColumnDef<Sale>[] = [
  {
    accessorKey: "id",
    header: "Sale ID",
  },
  {
    accessorKey: "customer.name",
    header: "Customer Name",
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
  },
  {
    accessorKey: "saleDate",
    header: "Sale Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
