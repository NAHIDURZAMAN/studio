"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Package, DollarSign, TrendingUp, Send } from "lucide-react"
import { Skeleton } from "../ui/skeleton"
import type { Order } from "@/types"

export default function StatsCards() {
  const [stats, setStats] = useState({ revenue: 0, processing: 0, delivered: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select('order_status, total_price')

      if (error) {
        console.error("Error fetching order stats:", error)
      } else {
        const deliveredOrders = data.filter(o => o.order_status === 'delivered');
        const processingOrders = data.filter(o => o.order_status === 'pending' || o.order_status === 'confirmed');
        
        const totalRevenue = deliveredOrders.reduce((acc, order) => acc + order.total_price, 0);

        setStats({
          revenue: totalRevenue,
          processing: processingOrders.length,
          delivered: deliveredOrders.length,
        })
      }
      setLoading(false)
    }

    fetchStats()

    const channel = supabase
      .channel('orders-stats-realtime')
      .on<Order>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchStats()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Total Orders</CardTitle>
          <DollarSign className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">৳{stats.revenue.toLocaleString()}</div>
          <p className="text-sm text-muted-foreground">Total revenue from delivered orders</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Order Processing</CardTitle>
          <Package className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.processing}</div>
           <p className="text-sm text-muted-foreground">Pending and confirmed orders</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Delivered</CardTitle>
          <Send className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.delivered}</div>
           <p className="text-sm text-muted-foreground">Successfully delivered orders</p>
        </CardContent>
      </Card>
    </div>
  )
}
