"use client";

import { useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Search, Trash, Filter } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product } from "@/apis/products";
import { Category } from "@/apis/categories";
import { ProductType } from "@/schemas/product-schema";
import { CategoryType } from "@/schemas/category-schema";
import EditProductModal from "@/components/products/edit-product-modal";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [unitFilter, setUnitFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null
  );

  const { data: products, isLoading: isLoadingProducts } = Product.GetAll.useQuery();
  const { data: categories, isLoading: isLoadingCategories } = Category.GetAll.useQuery();

  const { mutate: deleteProduct, isPending: isDeleting } = Product.Delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["Products"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: unarchiveProduct, isPending: isUnarchiving } = Product.Unarchive.useMutation({
    onSuccess: () => {
      toast.success("Product unarchived successfully");
      queryClient.invalidateQueries({ queryKey: ["Products"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products
      .filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.barcode.includes(searchTerm.toLowerCase());
        const matchesUnit = unitFilter === "all" || product.unit === unitFilter;
        const matchesCategory = categoryFilter === "all" || product.categoryId === Number(categoryFilter);
        return matchesSearch && matchesUnit && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        } else if (sortBy === "price") {
          return Number(a.sellingPrice) - Number(b.sellingPrice);
        } else if (sortBy === "date") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
  }, [products, searchTerm, unitFilter, categoryFilter, sortBy]);

  const handleEdit = (product: ProductType) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
  };

  const handleUnarchive = (id: string) => {
    unarchiveProduct(id);
  };

  const totalPages = 1; // Replace with actual total pages
  const currentPage = 1; // Replace with actual current page

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/app/products/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={unitFilter} onValueChange={setUnitFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <span>Filter by unit</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Units</SelectItem>
            <SelectItem value="pcs">Pieces</SelectItem>
            <SelectItem value="kg">Kilograms</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <span>Filter by category</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((category: CategoryType) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="date">Date Created</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Barcode</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingProducts ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.barcode}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell>{product.sellingPrice}</TableCell>
                  <TableCell>
                    {categories?.find((c) => c.id === product.categoryId)?.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isArchived ? "secondary" : "default"}>
                      {product.isArchived ? "Archived" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(product.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
                      disabled={isDeleting}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Showing {filteredProducts.length} of {products?.length} products
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={currentPage === 1}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
      {selectedProduct && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          product={selectedProduct}
        />
      )}
    </div>
  );
}
