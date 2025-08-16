"use client"

import * as React from "react"
import { useMemo, useState, useEffect } from "react"
import type { Product, Filters } from "@/types"
import Navbar from "@/components/navbar"
import ProductFilters from "@/components/product-filters"
import ProductCard from "@/components/product-card"
import CheckoutSheet from "@/components/checkout-sheet"
import Footer from "@/components/footer"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"

const priceRanges = {
  'under-1000': (price: number) => price < 1000,
  '1000-2000': (price: number) => price >= 1000 && price <= 2000,
  'premium': (price: number) => price > 2000,
  'all': () => true,
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    colors: [],
    priceRange: 'all',
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data as Product[]);
      }
      setLoading(false);
    };
    
    fetchProducts();

    const channel = supabase
      .channel('products-changes')
      .on<Product>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          fetchProducts(); // Refetch all products on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleBuyNow = (product: Product) => {
    setSelectedProduct(product);
  };

  const searchSuggestions = useMemo(() => {
    if (!searchTerm) return [];
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const categoryMatch = filters.categories.length === 0 || filters.categories.includes(product.category);
      const colorMatch = filters.colors.length === 0 || filters.colors.includes(product.color);
      const priceMatch = priceRanges[filters.priceRange as keyof typeof priceRanges](product.price);
      const searchMatch = searchTerm === "" || product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && colorMatch && priceMatch && searchMatch;
    });
  }, [filters, searchTerm, products]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
           <div className="text-center mb-12">
             <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-foreground">
               Your Style, Your Way.
             </h1>
             <p className="mt-4 text-lg font-alegreya text-muted-foreground max-w-2xl mx-auto">
               From the streets of Mirpur to every corner of Bangladesh, X Style delivers the freshest urban fashion.
             </p>
           </div>
          
          <ProductFilters 
            onFilterChange={setFilters} 
            onSearchChange={setSearchTerm} 
            currentFilters={filters}
            searchTerm={searchTerm}
            searchSuggestions={searchSuggestions}
          />

          <section className="mt-8">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} onBuyNow={handleBuyNow} />
                  ))}
                </div>
                {filteredProducts.length === 0 && (
                   <div className="col-span-full text-center py-16">
                      <p className="text-muted-foreground text-lg">No products match your filters. Try different options!</p>
                   </div>
                )}
              </>
            )}
          </section>
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

function CardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[250px] w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    </div>
  )
}
