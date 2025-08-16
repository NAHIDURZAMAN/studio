"use client"

import { useEffect, useState } from "react"
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

export default function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
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
      } else {
        setOrders(data as any)
      }
      setLoading(false);
    }

    fetchOrders()
  }, [])

  if (loading) {
    return <div>Loading orders...</div>
  }
  
  if (orders.length === 0) {
    return <p>No orders yet.</p>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{format(new Date(order.created_at), 'PPp')}</TableCell>
                <TableCell>
                    <div className="font-medium">{order.customer_name}</div>
                    <div>{order.customer_phone}</div>
                </TableCell>
                <TableCell>
                    {order.products?.name || 'N/A'} (x{order.quantity})
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
  )
}
