"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Search, X, Filter } from "lucide-react"
import type { ListUsersQueryType } from "@/apis/admin"

interface AdvancedSearchProps {
  onSearch: (query: ListUsersQueryType) => void
  currentQuery: ListUsersQueryType
  isLoading?: boolean
}

export function AdvancedSearch({ onSearch, currentQuery, isLoading }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchParams, setSearchParams] = useState<ListUsersQueryType>(currentQuery)

  const handleSearch = () => {
    onSearch(searchParams)
  }

  const handleReset = () => {
    const resetParams: ListUsersQueryType = {}
    setSearchParams(resetParams)
    onSearch(resetParams)
  }

  const updateSearchParam = (key: keyof ListUsersQueryType, value: any) => {
    setSearchParams((prev) => ({
      ...prev,
      [key]: value || undefined,
    }))
  }

  const hasActiveFilters = Object.keys(currentQuery).length > 0

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex items-center justify-between p-0 h-auto">
              <CardTitle className="flex items-center gap-2 text-base">
                <Filter className="h-4 w-4" />
                Advanced Search
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {Object.keys(currentQuery).length} active
                  </Badge>
                )}
              </CardTitle>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Search Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Search</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="searchField" className="text-xs text-muted-foreground">
                    Search Field
                  </Label>
                  <Select
                    value={searchParams.searchField || ""}
                    onValueChange={(value) => updateSearchParam("searchField", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="searchOperator" className="text-xs text-muted-foreground">
                    Operator
                  </Label>
                  <Select
                    value={searchParams.searchOperator || ""}
                    onValueChange={(value) => updateSearchParam("searchOperator", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="starts_with">Starts with</SelectItem>
                      <SelectItem value="ends_with">Ends with</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="searchValue" className="text-xs text-muted-foreground">
                    Search Value
                  </Label>
                  <Input
                    id="searchValue"
                    placeholder="Enter search term"
                    value={searchParams.searchValue || ""}
                    onChange={(e) => updateSearchParam("searchValue", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Sorting Section */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Sorting</Label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sortBy" className="text-xs text-muted-foreground">
                    Sort By
                  </Label>
                  <Select
                    value={searchParams.sortBy || ""}
                    onValueChange={(value) => updateSearchParam("sortBy", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field to sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="createdAt">Join Date</SelectItem>
                      <SelectItem value="role">Role</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortDirection" className="text-xs text-muted-foreground">
                    Direction
                  </Label>
                  <Select
                    value={searchParams.sortDirection || ""}
                    onValueChange={(value) => updateSearchParam("sortDirection", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Filter Section */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Additional Filters</Label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filterField" className="text-xs text-muted-foreground">
                    Filter Field
                  </Label>
                  <Select
                    value={searchParams.filterField || ""}
                    onValueChange={(value) => updateSearchParam("filterField", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="role">Role</SelectItem>
                      <SelectItem value="emailVerified">Email Verified</SelectItem>
                      <SelectItem value="banned">Banned Status</SelectItem>
                      <SelectItem value="createdAt">Join Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filterOperator" className="text-xs text-muted-foreground">
                    Operator
                  </Label>
                  <Select
                    value={searchParams.filterOperator || ""}
                    onValueChange={(value) => updateSearchParam("filterOperator", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eq">Equals</SelectItem>
                      <SelectItem value="ne">Not equals</SelectItem>
                      <SelectItem value="gt">Greater than</SelectItem>
                      <SelectItem value="gte">Greater than or equal</SelectItem>
                      <SelectItem value="lt">Less than</SelectItem>
                      <SelectItem value="lte">Less than or equal</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filterValue" className="text-xs text-muted-foreground">
                    Filter Value
                  </Label>
                  <Input
                    id="filterValue"
                    placeholder="Enter filter value"
                    value={searchParams.filterValue?.toString() || ""}
                    onChange={(e) => updateSearchParam("filterValue", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Pagination Section */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Pagination</Label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="limit" className="text-xs text-muted-foreground">
                    Results per page
                  </Label>
                  <Select
                    value={searchParams.limit?.toString() || ""}
                    onValueChange={(value) => updateSearchParam("limit", Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="offset" className="text-xs text-muted-foreground">
                    Offset
                  </Label>
                  <Input
                    id="offset"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={searchParams.offset?.toString() || ""}
                    onChange={(e) => updateSearchParam("offset", Number.parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button onClick={handleSearch} disabled={isLoading} className="flex-1 sm:flex-none">
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? "Searching..." : "Apply Filters"}
              </Button>
              <Button variant="outline" onClick={handleReset} disabled={isLoading}>
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
