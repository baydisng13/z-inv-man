"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Trash } from "lucide-react";
import EditCategoryModal from "@/components/categories/edit-category-modal";
import NewCategoryModal from "@/components/categories/new-category-modal";
import { useGlobalModal } from "@/store/useGlobalModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import CustomerTableSkeleton from "@/components/customer-table-skeleton";
import { Label } from "@/components/ui/label";
import { CategoryType } from "@/schemas/category-schema";
import useConfirmationStore from "@/store/confirmation";
import api from "@/apis";

export default function CategoriesPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null
  );
  const { openModal } = useGlobalModal();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: categories, isLoading } = api.Category.GetAll.useQuery();
  const { mutate: deleteCategory } = api.Category.Delete.useMutation();
  const { OpenConfirmation, CloseConfirmation } = useConfirmationStore();

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter((category) =>
      Object.values(category).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [categories, searchTerm]);

  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredCategories.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredCategories, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredCategories.length / rowsPerPage);

  const handleEdit = (c: CategoryType) => {
    setSelectedCategory(c);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: number) => {
    OpenConfirmation({
      title: "Delete Category",
      description: "Are you sure you want to delete this category?",
      onAction: () => {
        deleteCategory(id);
        CloseConfirmation();
      },
      onCancel: CloseConfirmation,
      actionLabel: "Delete",
      cancelLabel: "Cancel",
    });
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const halfMaxPages = Math.floor(maxPagesToShow / 2);
    let startPage = Math.max(1, currentPage - halfMaxPages);
    let endPage = Math.min(totalPages, currentPage + halfMaxPages);

    if (currentPage - 1 <= halfMaxPages) {
      endPage = Math.min(totalPages, maxPagesToShow);
    }

    if (totalPages - currentPage < halfMaxPages) {
      startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Button variant="ghost" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
              <ChevronsLeft />
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button variant="ghost" size="icon" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
              <ChevronLeft />
            </Button>
          </PaginationItem>
          {startPage > 1 && <PaginationItem>...</PaginationItem>}
          {pageNumbers.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(page); }} isActive={currentPage === page}>
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          {endPage < totalPages && <PaginationItem>...</PaginationItem>}
          <PaginationItem>
            <Button variant="ghost" size="icon" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
              <ChevronRight />
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button variant="ghost" size="icon" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
              <ChevronsRight />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => openModal({ title: "Create New Category", content: <NewCategoryModal /> })}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      {isLoading ? (
        <CustomerTableSkeleton />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="w-full"  >{category.name}</TableCell>
                  <TableCell className="flex gap-2 pr-14">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           <div className="flex justify-between items-center mt-4 w-full ">
            <div className="flex flex-col w-full  gap-2">
              <Label>Rows per page:</Label>
              <Select onValueChange={(value) => setRowsPerPage(Number(value))}>
                <SelectTrigger className="">
                  <SelectValue placeholder={rowsPerPage} />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50].map((value) => (
                    <SelectItem key={value} value={String(value)}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                {`Showing ${paginatedCategories.length} of ${filteredCategories.length} categories`}
              </span>
            </div>
            {renderPagination()}
          </div>
        </>
      )}
      {selectedCategory && (
        <EditCategoryModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          category={selectedCategory}
        />
      )}
    </div>
  );
}