
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
const colors = ['All', 'Black', 'White', 'Navy', 'Grey', 'Other'];
const priceRanges = [
  { value: 'all', label: 'All Prices' },
  { value: 'under-500', label: 'Under ৳500' },
  { value: '500-1000', label: '৳500 - ৳1000' },
  { value: '1000-2000', label: '৳1000 - ৳2000' },
  { value: '2000-3000', label: '৳2000 - ৳3000' },
  { value: 'premium', label: 'Premium (৳3000+)' },
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
    <div className="bg-secondary/50 p-6 rounded-lg border">
      <div className="flex flex-col space-y-4">
        
        {/* Search Bar */}
        <div className="relative w-full" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setShowSuggestions(true)}
            className="pl-10 h-12 text-base"
          />
          {showSuggestions && searchTerm && searchSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
              <ul className="py-1 max-h-60 overflow-y-auto">
                {searchSuggestions.slice(0, 6).map(product => (
                  <li 
                    key={product.id} 
                    className="px-4 py-2 text-sm text-foreground hover:bg-accent cursor-pointer flex items-center justify-between"
                    onClick={() => handleSuggestionClick(product.name)}
                  >
                    <span>{product.name}</span>
                    <span className="text-xs text-muted-foreground">৳{product.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Filter Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Category</label>
            <Select onValueChange={handleCategoryChange} value={activeCategory}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                    {category === 'All' && (
                      <span className="ml-2 text-xs text-muted-foreground">(All)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Color</label>
            <Select onValueChange={handleColorChange} value={currentFilters.colors[0] || 'All'}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Colors" />
              </SelectTrigger>
              <SelectContent>
                {colors.map(color => (
                  <SelectItem key={color} value={color}>
                    <div className="flex items-center gap-2">
                      {color !== 'All' && (
                        <div 
                          className={`w-3 h-3 rounded-full border ${
                            color === 'Black' ? 'bg-black' :
                            color === 'White' ? 'bg-white border-gray-300' :
                            color === 'Navy' ? 'bg-blue-900' :
                            color === 'Grey' ? 'bg-gray-500' :
                            'bg-gradient-to-r from-purple-400 to-pink-400'
                          }`}
                        />
                      )}
                      {color}
                      {color === 'All' && (
                        <span className="ml-1 text-xs text-muted-foreground">(All)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Price Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Price Range</label>
            <Select onValueChange={handlePriceChange} value={currentFilters.priceRange}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Prices" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map(range => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </div>

        {/* Active Filters & Clear Button */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-primary/10 text-primary">
                  Search: "{searchTerm}"
                </div>
              )}
              {currentFilters.categories.map(category => (
                <div key={category} className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  Category: {category}
                </div>
              ))}
              {currentFilters.colors.map(color => (
                <div key={color} className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Color: {color}
                </div>
              ))}
              {currentFilters.priceRange !== 'all' && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                  Price: {priceRanges.find(r => r.value === currentFilters.priceRange)?.label}
                </div>
              )}
            </div>
            
            <Button variant="outline" onClick={clearFilters} size="sm" className="ml-4">
              <X className="mr-2 h-4 w-4" />
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
