"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { CustomOrder } from "@/types"
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
import { format } from 'date-fns'
import { Skeleton } from "../ui/skeleton"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Button } from "../ui/button"
import { Download, CheckCircle, PackagePlus } from "lucide-react"

export default function CustomOrdersView() {
  const [orders, setOrders] = useState<CustomOrder[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCustomOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("custom_orders")
      .select(`*`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching custom orders:", error)
      setOrders([])
    } else {
      setOrders(data)
    }
    setLoading(false);
  }, [])

  useEffect(() => {
    fetchCustomOrders()
    
    const channel = supabase
      .channel('custom-orders-realtime-channel')
      .on<CustomOrder>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'custom_orders' },
        () => {
           fetchCustomOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [fetchCustomOrders])

  const handlePromoteToProduct = (order: CustomOrder) => {
    // This will later navigate to the Add Product page with pre-filled data
    console.log("Promoting order to product:", order.id)
    toast({
        title: "Feature Coming Soon!",
        description: "This will open the 'Add Product' form with the design pre-loaded.",
    });
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custom Design Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
             <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }
  
  if (orders.length === 0) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>Custom Design Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No custom orders have been submitted yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Custom Design Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Designs</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{format(new Date(order.created_at), 'PP')}</TableCell>
                  <TableCell>
                      <div className="font-medium">{order.customer_name}</div>
                      <div>{order.customer_phone}</div>
                  </TableCell>
                  <TableCell>
                      <div className="flex items-center gap-2">
                         <a href={order.front_design_url} target="_blank" rel="noopener noreferrer">
                            <Image src={order.front_design_url} alt="Front Design" width={40} height={40} className="rounded-md object-cover border"/>
                         </a>
                         {order.back_design_url && (
                             <a href={order.back_design_url} target="_blank" rel="noopener noreferrer">
                                <Image src={order.back_design_url} alt="Back Design" width={40} height={40} className="rounded-md object-cover border"/>
                            </a>
                         )}
                      </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.size}</Badge>
                  </TableCell>
                  <TableCell className="text-right">৳{order.total_price.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <Badge>{order.status}</Badge>
                  </TableCell>
                   <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handlePromoteToProduct(order)}>
                        <PackagePlus className="mr-2 h-4 w-4"/>
                        Add to Products
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}

// Temporary toast function placeholder to avoid breaking the component
// In a real scenario, you'd import this from your hooks
const toast = (options: {title: string, description: string}) => {
    console.log(`Toast: ${options.title} - ${options.description}`);
}
