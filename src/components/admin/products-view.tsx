"use client"

import { useEffect, useState, useCallback } from "react"
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

export default function ProductsView() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

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
        (payload) => {
           fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [fetchProducts])

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
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Color</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow 
                  key={product.id} 
                >
                  <TableCell>
                    <Image 
                      src={product.images[0]} 
                      alt={product.name} 
                      width={40} 
                      height={50} 
                      className="rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                   <TableCell>
                    <Badge variant="outline">{product.color}</Badge>
                  </TableCell>
                  <TableCell className="text-right">৳{product.price.toLocaleString()}</TableCell>
                  <TableCell className="text-center">{product.stock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
