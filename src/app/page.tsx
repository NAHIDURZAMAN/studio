"use client"

import * as React from "react"
import { useMemo, useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import type { Product, Filters } from "@/types"
import Navbar from "@/components/navbar"
import ProductFilters from "@/components/product-filters"
import ProductCard from "@/components/product-card"
import CheckoutSheet from "@/components/checkout-sheet"
import Footer from "@/components/footer"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"
import PaginationControls from "@/components/pagination-controls"

const priceRanges = {
  'under-1000': (price: number) => price < 1000,
  '1000-2000': (price: number) => price >= 1000 && price <= 2000,
  'premium': (price: number) => price > 2000,
  'all': () => true,
};

const PRODUCTS_PER_PAGE = 20;

function HomePageContent() {
  const searchParams = useSearchParams();
  const isNewArrivals = searchParams.get('new_arrivals') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    colors: [],
    priceRange: 'all',
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const fetchProducts = useCallback(async (page: number, currentFilters: Filters, currentSearchTerm: string, newArrivals: boolean) => {
    setLoading(true);
    const from = (page - 1) * PRODUCTS_PER_PAGE;
    const to = from + PRODUCTS_PER_PAGE - 1;

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });

    if (currentSearchTerm) {
      query = query.ilike('name', `%${currentSearchTerm}%`);
    }
    if (currentFilters.categories.length > 0) {
      query = query.in('category', currentFilters.categories);
    }
    if (currentFilters.colors.length > 0) {
      query = query.in('color', currentFilters.colors);
    }
    if (newArrivals) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query = query.gte('created_at', thirtyDaysAgo.toISOString());
    }
    
    // Price range filter is applied client-side after fetch

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } else {
      let filteredData = data as Product[];
      // Apply price filter client-side
      if (currentFilters.priceRange !== 'all') {
          const priceFilterFunc = priceRanges[currentFilters.priceRange as keyof typeof priceRanges];
          filteredData = filteredData.filter(p => priceFilterFunc(p.price));
      }
      setProducts(filteredData);
      setTotalProducts(count || 0);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts(currentPage, filters, searchTerm, isNewArrivals);

    const channel = supabase
      .channel('products-changes')
      .on<Product>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          fetchProducts(currentPage, filters, searchTerm, isNewArrivals); // Refetch current page on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentPage, filters, searchTerm, isNewArrivals, fetchProducts]);

  const handleFilterChange = (newFilters: Filters) => {
    setCurrentPage(1);
    setFilters(newFilters);
  };

  const handleSearchChange = (newSearchTerm: string) => {
    setCurrentPage(1);
    setSearchTerm(newSearchTerm);
  };

  const handleBuyNow = (product: Product) => {
    setSelectedProduct(product);
  };
  
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
           <div className="text-center mb-12">
             <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-foreground">
               {isNewArrivals ? "New Arrivals" : "Your Style, Your Way."}
             </h1>
             <p className="mt-4 text-lg font-alegreya text-muted-foreground max-w-2xl mx-auto">
               {isNewArrivals 
                ? "Check out the latest styles added in the last 30 days."
                : "From the streets of Mirpur to every corner of Bangladesh, X Style delivers the freshest urban fashion."
               }
             </p>
           </div>
          
          <ProductFilters 
            onFilterChange={handleFilterChange} 
            onSearchChange={handleSearchChange} 
            currentFilters={filters}
            searchTerm={searchTerm}
            searchSuggestions={[]} // Suggestions might need rethink with pagination
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 md:gap-6">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} onBuyNow={handleBuyNow} />
                  ))}
                </div>
                {products.length === 0 && (
                   <div className="col-span-full text-center py-16">
                      <p className="text-muted-foreground text-lg">No products match your search or filters. Try different options!</p>
                   </div>
                )}
              </>
            )}
          </section>
          
          {totalPages > 1 && !loading && (
             <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
          )}
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

export default function Home() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </React.Suspense>
  )
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
