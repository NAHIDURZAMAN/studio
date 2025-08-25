"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { Product } from "@/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Skeleton } from "../ui/skeleton"
import Image from "next/image"
import { Button } from "../ui/button"
import { ArrowUpDown, Edit, Eye, Package } from "lucide-react"
import ProductEditDialog from "./product-edit-dialog"

export default function ProductsView() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' })

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select(`*`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching products:", error)
      setProducts([])
    } else {
      // Debug: Check if discount fields are being loaded
      console.log("Products loaded:", data?.map(p => ({
        name: p.name,
        price: p.price,
        discount_percentage: p.discount_percentage,
        discount_price: p.discount_price
      })));
      setProducts(data as any)
    }
    setLoading(false);
  }, [])

  useEffect(() => {
    fetchProducts()
    
    const channel = supabase
      .channel('products-realtime-channel')
      .on<Product>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
           fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [fetchProducts])

  const sortedProducts = useMemo(() => {
    let sortableItems = [...products];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        
        if (aValue == null || bValue == null) return 0;
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [products, sortConfig]);

  const requestSort = (key: keyof Product) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  }

  const getSortIcon = (key: keyof Product) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === 'ascending' 
      ? <ArrowUpDown className="ml-2 h-4 w-4" /> 
      : <ArrowUpDown className="ml-2 h-4 w-4" />;
  };


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
             <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }
  
  if (products.length === 0) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No products found. Add a product to see it here.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              All Products
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Total: {products.length} products
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('name')}>
                    Name
                    {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead>
                   <Button variant="ghost" onClick={() => requestSort('category')}>
                    Category
                    {getSortIcon('category')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('color')}>
                    Color
                    {getSortIcon('color')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" onClick={() => requestSort('price')}>
                    Price
                    {getSortIcon('price')}
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button variant="ghost" onClick={() => requestSort('stock')}>
                    Stock
                    {getSortIcon('stock')}
                  </Button>
                </TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="relative w-12 h-12">
                      <Image 
                        src={product.images[0]} 
                        alt={product.name} 
                        fill
                        className="rounded-md object-cover"
                      />
                      {product.discount_percentage && product.discount_percentage > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full">
                          -{product.discount_percentage.toFixed(0)}%
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px]">
                    <div>
                      <p className="truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.sizes.join(', ')}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.color}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {product.discount_percentage && product.discount_percentage > 0 ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-end gap-2">
                          <span className="line-through text-red-500 text-sm">৳{product.price.toLocaleString()}</span>
                          <Badge variant="destructive" className="text-xs">-{product.discount_percentage}%</Badge>
                        </div>
                        <div className="text-green-600 font-bold">
                          ৳{(product.discount_price || (product.price - (product.price * product.discount_percentage / 100))).toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <span>৳{product.price.toLocaleString()}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={product.stock < 10 ? "destructive" : product.stock < 20 ? "secondary" : "default"}>
                      {product.stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Product Edit Dialog */}
      {selectedProduct && (
        <ProductEditDialog
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onOpenChange={(open) => {
            if (!open) setSelectedProduct(null)
          }}
          onProductUpdated={() => {
            console.log("Product updated - refreshing products list...");
            // Small delay to ensure database has processed the update
            setTimeout(() => {
              fetchProducts();
            }, 200);
            // Force re-render by clearing selected product
            setTimeout(() => setSelectedProduct(null), 100);
          }}
        />
      )}
    </>
  )
}
