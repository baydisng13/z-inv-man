"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus } from "lucide-react";
import api from "@/apis";
import useConfirmationStore from "@/store/confirmation";
import NewSupplierModal from "@/components/suppliers/new-supplier-modal";
import EditSupplierModal from "@/components/suppliers/edit-supplier-modal";

import queryClient from "@/lib/queryClient";
import { useGlobalModal } from "@/store/useGlobalModal";

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);
  const [isEditSupplierModalOpen, setIsEditSupplierModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null
  );

  const { OpenConfirmation } = useConfirmationStore();
  const { openModal } = useGlobalModal();

  const {
    data: suppliersData,
    isLoading,
    isError,
    error,
  } = api.Supplier.GetAll.useQuery();

  const { mutate: deleteSupplier } = api.Supplier.Delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Suppliers"] });
    },
  });

  const filteredSuppliers = suppliersData
    ? suppliersData.filter((supplier) => {
        const matchesSearch =
          supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (supplier.email &&
            supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (supplier.phone && supplier.phone.includes(searchTerm));
        return matchesSearch;
      })
    : [];

  if (isLoading) return <div>Loading suppliers...</div>;
  if (isError) return <div>Error loading suppliers: {error?.message}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage your business suppliers
          </p>
        </div>
        <Button
          onClick={() => {
            openModal({
              title: "Create New Supplier",
              content: <NewSupplierModal />,
              onClose: () => setIsNewSupplierModalOpen(false),
            });
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Supplier
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Country</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.email || "-"}</TableCell>
                <TableCell>{supplier.phone || "-"}</TableCell>
                <TableCell>{supplier.address || "-"}</TableCell>
                <TableCell>{supplier.country || "-"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedSupplierId(supplier.id);
                      setIsEditSupplierModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => {
                      OpenConfirmation({
                        title: "Delete Supplier",
                        description: `Are you sure you want to delete the supplier "${supplier.name}"?`,
                        actionLabel: "Delete",
                        onAction: () => deleteSupplier(supplier.id),
                        cancelLabel: "Cancel",
                        onCancel: () => {},
                      });
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedSupplierId && (
        <EditSupplierModal
          isOpen={isEditSupplierModalOpen}
          onClose={() => {
            setIsEditSupplierModalOpen(false);
            setSelectedSupplierId(null);
          }}
          supplierId={selectedSupplierId}
        />
      )}
    </div>
  );
}
