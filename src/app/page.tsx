"use client"

import * as React from "react"
import { useMemo, useState } from "react"
import type { Product, Filters } from "@/types"
import Header from "@/components/header"
import Hero from "@/components/hero"
import UrgencyBanner from "@/components/urgency-banner"
import IncentivesBanner from "@/components/incentives-banner"
import ProductFilters from "@/components/product-filters"
import ProductCard from "@/components/product-card"
import CheckoutSheet from "@/components/checkout-sheet"
import Footer from "@/components/footer"
import { Separator } from "@/components/ui/separator"

const mockProducts: Product[] = [
  { id: 1, name: 'Urban Explorer Tee', category: 'Drop Shoulder Tees', price: 950, color: 'Classic Black', image: 'https://placehold.co/400x500.png', stock: 15, description: "A classic black drop shoulder tee, perfect for the urban explorer. Made with 100% premium cotton.", dataAiHint: "black t-shirt" },
  { id: 2, name: 'City Limitless Jersey', category: 'Jerseys', price: 1800, color: 'Crisp White', image: 'https://placehold.co/400x500.png', stock: 8, description: "Breathe easy with this stylish white jersey. Its lightweight fabric is ideal for Dhaka's heat.", dataAiHint: "white jersey" },
  { id: 3, name: 'Mirpur Midnight Hoodie', category: 'Hoodies', price: 2500, color: 'Navy Blue', image: 'https://placehold.co/400x500.png', stock: 12, description: "Stay cozy during late-night hangouts with this deep navy hoodie. A true Mirpur original.", dataAiHint: "navy hoodie" },
  { id: 4, name: 'Dhaka Basic Tee', category: 'Basic Collection', price: 800, color: 'Crisp White', image: 'https://placehold.co/400x500.png', stock: 30, description: "The essential white tee. A must-have in every wardrobe, combining comfort and style.", dataAiHint: "white t-shirt" },
  { id: 5, name: 'Stealth Mode Tee', category: 'Drop Shoulder Tees', price: 1100, color: 'Classic Black', image: 'https://placehold.co/400x500.png', stock: 5, description: "A premium black drop shoulder tee with a subtle, reflective logo. Limited stock available.", dataAiHint: "black t-shirt" },
  { id: 6, name: 'Gameday Champion Jersey', category: 'Jerseys', price: 1900, color: 'Heather Grey', image: 'https://placehold.co/400x500.png', stock: 20, description: "Rep your style with our Gameday Champion jersey, in a versatile heather grey.", dataAiHint: "grey jersey" },
  { id: 7, name: 'Concrete Jungle Hoodie', category: 'Hoodies', price: 2200, color: 'Classic Black', image: 'https://placehold.co/400x500.png', stock: 0, description: "Our most popular black hoodie. Currently out of stock, but sign up for restock alerts!", dataAiHint: "black hoodie" },
  { id: 8, name: 'Simple & Solid Tee', category: 'Basic Collection', price: 850, color: 'Seasonal Colors', image: 'https://placehold.co/400x500.png', stock: 25, description: "A high-quality basic tee in a unique seasonal color. Versatile and durable.", dataAiHint: "green t-shirt" },
];

const priceRanges = {
  'under-1000': (price: number) => price < 1000,
  '1000-2000': (price: number) => price >= 1000 && price <= 2000,
  'premium': (price: number) => price > 2000,
  'all': () => true,
};

export default function Home() {
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    colors: [],
    priceRange: 'all',
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleBuyNow = (product: Product) => {
    setSelectedProduct(product);
  };

  const filteredProducts = useMemo(() => {
    return mockProducts.filter(product => {
      const categoryMatch = filters.categories.length === 0 || filters.categories.includes(product.category);
      const colorMatch = filters.colors.length === 0 || filters.colors.includes(product.color);
      const priceMatch = priceRanges[filters.priceRange as keyof typeof priceRanges](product.price);
      return categoryMatch && colorMatch && priceMatch;
    });
  }, [filters]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <UrgencyBanner />
        <Hero />
        <IncentivesBanner />
        
        <div className="container mx-auto px-4 py-8">
          <div className="md:grid md:grid-cols-12 md:gap-8">
            <aside className="md:col-span-3 lg:col-span-2 mb-8 md:mb-0">
              <ProductFilters onFilterChange={setFilters} />
            </aside>
            <section className="md:col-span-9 lg:col-span-10">
              <h2 className="text-3xl font-headline mb-6 text-foreground">Our Collection</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} onBuyNow={handleBuyNow} />
                ))}
              </div>
              {filteredProducts.length === 0 && (
                 <div className="col-span-full text-center py-16">
                    <p className="text-muted-foreground text-lg">No products match your filters. Try different options!</p>
                 </div>
              )}
            </section>
          </div>
        </div>

        <Separator className="my-12 container" />

        <Footer />
      </main>
      
      <CheckoutSheet 
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProduct(null);
          }
        }}
      />
    </div>
  );
}
