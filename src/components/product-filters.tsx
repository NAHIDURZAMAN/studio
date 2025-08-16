"use client"

import type { Filters, Product } from "@/types"
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Search, X } from "lucide-react"

type ProductFiltersProps = {
  onFilterChange: (filters: Filters) => void;
  onSearchChange: (searchTerm: string) => void;
  currentFilters: Filters;
  searchTerm: string;
  searchSuggestions: Product[];
};

const categories = ['All', 'Drop Shoulder Tees', 'Jerseys', 'Hoodies', 'Basic Collection'];
const colors = ['All', 'Black', 'White', 'Navy', 'Grey'];
const priceRanges = [
  { value: 'all', label: 'All Prices' },
  { value: 'under-1000', label: 'Under ৳1000' },
  { value: '1000-2000', label: '৳1000 - ৳2000' },
  { value: 'premium', label: 'Premium (৳2000+)' },
];

export default function ProductFilters({ onFilterChange, onSearchChange, currentFilters, searchTerm, searchSuggestions }: ProductFiltersProps) {
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategoryChange = (category: string) => {
    const newCategories = category === 'All' ? [] : [category];
    onFilterChange({ ...currentFilters, categories: newCategories });
  };
  
  const handleColorChange = (color: string) => {
    const newColors = color === 'All' ? [] : [color];
    onFilterChange({ ...currentFilters, colors: newColors });
  }

  const handlePriceChange = (priceRange: string) => {
    onFilterChange({ ...currentFilters, priceRange });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
    setShowSuggestions(true);
  }

  const handleSuggestionClick = (productName: string) => {
    onSearchChange(productName);
    setShowSuggestions(false);
  }

  const clearFilters = () => {
    onFilterChange({ categories: [], colors: [], priceRange: 'all' });
    onSearchChange("");
  }
  
  const activeCategory = currentFilters.categories.length > 0 ? currentFilters.categories[0] : 'All';
  const hasActiveFilters = currentFilters.categories.length > 0 || currentFilters.colors.length > 0 || currentFilters.priceRange !== 'all' || searchTerm !== "";

  return (
    <div className="bg-secondary/50 p-4 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-12 lg:col-span-4">
           <div className="relative" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-10"
              />
              {showSuggestions && searchTerm && searchSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
                  <ul className="py-1">
                    {searchSuggestions.map(product => (
                      <li 
                        key={product.id} 
                        className="px-4 py-2 text-sm text-foreground hover:bg-accent cursor-pointer"
                        onClick={() => handleSuggestionClick(product.name)}
                      >
                        {product.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
           </div>
        </div>
        <div className="md:col-span-12 lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Select onValueChange={handleCategoryChange} value={activeCategory}>
                  <SelectTrigger className="w-full">
                      <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                      {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
              <Select onValueChange={handleColorChange} value={currentFilters.colors[0] || 'All'}>
                  <SelectTrigger className="w-full">
                      <SelectValue placeholder="Color" />
                  </SelectTrigger>
                  <SelectContent>
                      {colors.map(color => (
                          <SelectItem key={color} value={color}>{color}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
               <Select onValueChange={handlePriceChange} value={currentFilters.priceRange}>
                  <SelectTrigger className="w-full">
                      <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent>
                      {priceRanges.map(range => (
                          <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
              {hasActiveFilters && (
                 <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-foreground col-span-full sm:col-span-1">
                    <X className="mr-2 h-4 w-4" />
                    Clear All
                </Button>
              )}
            </div>
        </div>

      </div>
    </div>
  );
}
