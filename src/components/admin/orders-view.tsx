"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { Order } from "@/types"
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
import OrderDetailsDialog from "./order-details-dialog"
import { Skeleton } from "../ui/skeleton"
import { cn } from "@/lib/utils"

export default function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        products (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error)
      setOrders([])
    } else {
      setOrders(data as any)
    }
    setLoading(false);
  }, [])

  useEffect(() => {
    fetchOrders()
    
    const channel = supabase
      .channel('orders-realtime-channel')
      .on<Order>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
           if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
            fetchOrders();
          } else if (payload.eventType === 'UPDATE') {
            setOrders(currentOrders =>
              currentOrders.map(order =>
                order.id === payload.new.id ? { ...order, ...payload.new as Order, products: order.products } : order
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [fetchOrders])

  const getStatusColorClass = (status: Order['order_status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100/50 hover:bg-yellow-100/80 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50';
      case 'confirmed':
        return 'bg-blue-100/50 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:hover:bg-blue-900/50';
      case 'shipped':
        return 'bg-green-100/50 hover:bg-green-100/80 dark:bg-green-900/30 dark:hover:bg-green-900/50';
      case 'cancelled':
        return 'bg-gray-200/50 hover:bg-gray-200/80 dark:bg-gray-700/30 dark:hover:bg-gray-700/50';
       case 'delivered':
        return 'bg-teal-100/50 hover:bg-teal-100/80 dark:bg-teal-900/30 dark:hover:bg-teal-900/50';
      default:
        return 'hover:bg-muted/50';
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
             <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }
  
  if (orders.length === 0) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No orders have been placed yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)} 
                  className={cn("cursor-pointer", getStatusColorClass(order.order_status))}
                >
                  <TableCell className="font-mono">{order.order_id || 'N/A'}</TableCell>
                  <TableCell>{format(new Date(order.created_at), 'PPp')}</TableCell>
                  <TableCell>
                      <div className="font-medium">{order.customer_name}</div>
                      <div>{order.customer_phone}</div>
                  </TableCell>
                  <TableCell>
                      {order.products?.name || 'N/A'} (x{order.quantity})
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.size}</Badge>
                  </TableCell>
                  <TableCell className="text-right">৳{order.total_price.toLocaleString()}</TableCell>
                  <TableCell className="text-center">
                    <Badge>{order.order_status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedOrder && (
        <OrderDetailsDialog 
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setSelectedOrder(null);
            }
          }}
          onStatusChange={fetchOrders}
        />
      )}
    </>
  )
}
