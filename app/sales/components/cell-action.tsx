
"use client";

import { useState } from "react";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Sale } from "@/schemas/sale-schema";
import api from "@/apis";
import ViewSaleModal from "@/components/sales/view-sale-modal";
import useConfirmationStore from "@/store/confirmation";

interface CellActionProps {
  data: Sale;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const { OpenConfirmation } = useConfirmationStore();

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Sale ID copied to clipboard.");
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await api.Sale.Delete.useMutation(data.id);
      toast.success("Sale deleted.");
      router.refresh();
    } catch (error) {
      toast.error("Make sure you removed all products using this sale first.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ViewSaleModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        saleId={data.id}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.id)}>
            <Copy className="mr-2 h-4 w-4" /> Copy Id
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setViewModalOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => OpenConfirmation({ 
            title: "Are you sure?",
            message: "This action cannot be undone.",
            onConfirm: onDelete,
          })}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
