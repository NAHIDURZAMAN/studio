"use client"

import { useState } from "react"
import type { Filters } from "@/types"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "./ui/button"
import { FilterX } from "lucide-react"

type ProductFiltersProps = {
  onFilterChange: (filters: Filters) => void;
};

const categories = ['Drop Shoulder Tees', 'Jerseys', 'Hoodies', 'Basic Collection'];
const colors = ['Classic Black', 'Crisp White', 'Navy Blue', 'Heather Grey', 'Seasonal Colors'];
const priceRanges = [
  { value: 'all', label: 'All Prices' },
  { value: 'under-1000', label: 'Under ৳1000' },
  { value: '1000-2000', label: '৳1000 - ৳2000' },
  { value: 'premium', label: 'Premium (৳2000+)' },
];

export default function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');

  const handleCategoryChange = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newCategories);
    onFilterChange({ categories: newCategories, colors: selectedColors, priceRange: selectedPriceRange });
  };

  const handleColorChange = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
      : [...selectedColors, color];
    setSelectedColors(newColors);
    onFilterChange({ categories: selectedCategories, colors: newColors, priceRange: selectedPriceRange });
  };

  const handlePriceChange = (priceRange: string) => {
    setSelectedPriceRange(priceRange);
    onFilterChange({ categories: selectedCategories, colors: selectedColors, priceRange });
  };
  
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedPriceRange('all');
    onFilterChange({ categories: [], colors: [], priceRange: 'all' });
  }

  return (
    <div className="sticky top-20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-headline">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
          <FilterX className="h-3 w-3 mr-1"/>
          Clear
        </Button>
      </div>
      <Accordion type="multiple" defaultValue={['category', 'price', 'color']} className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger className="font-semibold">Category</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <Label htmlFor={category} className="font-normal">{category}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="color">
          <AccordionTrigger className="font-semibold">Color</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {colors.map(color => (
                <div key={color} className="flex items-center space-x-2">
                  <Checkbox
                    id={color}
                    checked={selectedColors.includes(color)}
                    onCheckedChange={() => handleColorChange(color)}
                  />
                  <Label htmlFor={color} className="font-normal">{color}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="price">
          <AccordionTrigger className="font-semibold">Price</AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={selectedPriceRange} onValueChange={handlePriceChange}>
              <div className="space-y-2">
                {priceRanges.map(range => (
                  <div key={range.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={range.value} id={range.value} />
                    <Label htmlFor={range.value} className="font-normal">{range.label}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
