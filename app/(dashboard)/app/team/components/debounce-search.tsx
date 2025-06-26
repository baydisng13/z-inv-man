import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input"; // assuming you're using ShadCN UI

const DebouncedSearch = ({ onSearch } : { onSearch: (query: string) => void }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500); // debounce delay in ms

    return () => {
      clearTimeout(handler); // cleanup on change
    };
  }, [searchQuery]);

  // use `debouncedQuery` to trigger search/filter logic
  useEffect(() => {
    if (debouncedQuery) {
      console.log("Triggering search for:", debouncedQuery);
      // Your API call or filtering logic here
    }
  }, [debouncedQuery]);

  return (
    <Input
      placeholder="Search members..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  );
};


export default DebouncedSearch;