"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Package, Send, TrendingUp } from "lucide-react"
import { Skeleton } from "../ui/skeleton"
import type { Order } from "@/types"

export default function StatsCards() {
  const [stats, setStats] = useState({ total: 0, delivered: 0, pending: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      const { data, error, count } = await supabase
        .from('orders')
        .select('order_status', { count: 'exact' })

      if (error) {
        console.error("Error fetching order stats:", error)
      } else {
        const deliveredCount = data.filter(o => o.order_status === 'delivered').length
        const pendingCount = data.filter(o => o.order_status === 'pending').length
        setStats({
          total: count || 0,
          delivered: deliveredCount,
          pending: pendingCount,
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
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
        </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">Total orders placed</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pending}</div>
           <p className="text-xs text-muted-foreground">Orders waiting for confirmation</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          <Send className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.delivered}</div>
           <p className="text-xs text-muted-foreground">Successfully delivered orders</p>
        </CardContent>
      </Card>
    </div>
  )
}
