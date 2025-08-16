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
          // When an update happens, find the order and update it in the local state.
           if (payload.eventType === 'UPDATE') {
            setOrders(currentOrders =>
              currentOrders.map(order =>
                order.id === payload.new.id ? { ...order, ...payload.new } : order
              )
            );
          } else {
            // For new inserts or deletions, a full refetch is safer.
            fetchOrders();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [fetchOrders])

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
        </Header>
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
                <TableRow key={order.id} onClick={() => setSelectedOrder(order)} className="cursor-pointer">
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
