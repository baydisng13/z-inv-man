
export interface ParsedQuery {
  searchField?: "email" | "name"
  searchOperator?: "contains" | "starts_with" | "ends_with"
  searchValue?: string
  limit?: number
  offset?: number
  sortBy?: string
  sortDirection?: "asc" | "desc"
  filterField?: string
  filterOperator?: "lt" | "eq" | "ne" | "lte" | "gt" | "gte" | "contains"
  filterValue?: string | number | boolean
  rawSearch?: string
}

export function parseSearchQuery(query: string): ParsedQuery {
  const result: ParsedQuery = {}
  
  if (!query.trim()) return result

  // Split by spaces but preserve quoted strings
  const tokens = query.match(/(?:[^\s"]+|"[^"]*")+/g) || []
  
  for (const token of tokens) {
    const cleanToken = token.replace(/"/g, '')
    
    // Handle different search patterns
    if (token.includes(':')) {
      const parts = cleanToken.split(':')
      
      if (parts.length >= 2) {
        const [key, ...valueParts] = parts
        const value = valueParts.join(':')
        
        switch (key.toLowerCase()) {
          case 'name':
            result.searchField = 'name'
            result.searchOperator = 'contains'
            result.searchValue = value
            break
            
          case 'email':
            result.searchField = 'email'
            result.searchOperator = 'contains'
            result.searchValue = value
            break
            
          case 'role':
            result.filterField = 'role'
            result.filterOperator = 'eq'
            result.filterValue = value
            break
            
          case 'status':
            result.filterField = 'status'
            result.filterOperator = 'eq'
            result.filterValue = value
            break
            
          case 'banned':
            result.filterField = 'banned'
            result.filterOperator = 'eq'
            result.filterValue = value.toLowerCase() === 'true'
            break
            
          case 'verified':
            result.filterField = 'emailVerified'
            result.filterOperator = 'eq'
            result.filterValue = value.toLowerCase() === 'true'
            break
            
          case 'sort':
            if (parts.length >= 3) {
              result.sortBy = parts[1]
              result.sortDirection = parts[2] as "asc" | "desc"
            } else {
              result.sortBy = value
              result.sortDirection = 'asc'
            }
            break
            
          case 'limit':
            const limitNum = parseInt(value)
            if (!isNaN(limitNum)) {
              result.limit = limitNum
            }
            break
            
          case 'offset':
            const offsetNum = parseInt(value)
            if (!isNaN(offsetNum)) {
              result.offset = offsetNum
            }
            break
            
          // Advanced search operators
          default:
            if (parts.length === 3) {
              const [field, operator, val] = parts
              if (['contains', 'starts_with', 'ends_with'].includes(operator)) {
                result.searchField = field as "email" | "name"
                result.searchOperator = operator as "contains" | "starts_with" | "ends_with"
                result.searchValue = val
              } else if (['lt', 'eq', 'ne', 'lte', 'gt', 'gte', 'contains'].includes(operator)) {
                result.filterField = field
                result.filterOperator = operator as any
                result.filterValue = val
              }
            }
            break
        }
      }
    } else {
      // Default search (search in name and email)
      result.rawSearch = cleanToken
      result.searchField = 'name'
      result.searchOperator = 'contains'
      result.searchValue = cleanToken
    }
  }
  
  return result
}

export function buildSearchSuggestions(currentQuery: string): string[] {
  const suggestions = [
    'name:john',
    'email:gmail.com',
    'role:admin',
    'role:user',
    'banned:true',
    'banned:false',
    'verified:true',
    'verified:false',
    'sort:name:asc',
    'sort:name:desc',
    'sort:createdAt:desc',
    'limit:10',
    'limit:50',
    'name:contains:john',
    'email:starts_with:admin',
    'email:ends_with:company.com',
  ]
  
  const query = currentQuery.toLowerCase()
  return suggestions.filter(s => s.includes(query) || query === '')
}

export function formatSearchQuery(parsed: ParsedQuery): string {
  const parts: string[] = []
  
  if (parsed.searchField && parsed.searchValue) {
    if (parsed.searchOperator === 'contains') {
      parts.push(`${parsed.searchField}:${parsed.searchValue}`)
    } else {
      parts.push(`${parsed.searchField}:${parsed.searchOperator}:${parsed.searchValue}`)
    }
  }
  
  if (parsed.filterField && parsed.filterValue !== undefined) {
    parts.push(`${parsed.filterField}:${parsed.filterValue}`)
  }
  
  if (parsed.sortBy) {
    parts.push(`sort:${parsed.sortBy}:${parsed.sortDirection || 'asc'}`)
  }
  
  if (parsed.limit) {
    parts.push(`limit:${parsed.limit}`)
  }
  
  if (parsed.offset) {
    parts.push(`offset:${parsed.offset}`)
  }
  
  if (parsed.rawSearch && !parts.length) {
    parts.push(parsed.rawSearch)
  }
  
  return parts.join(' ')
}
