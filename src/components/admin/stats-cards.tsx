"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Package, DollarSign, TrendingUp, Send, ShoppingCart, MessageSquare, Mail } from "lucide-react"
import { Skeleton } from "../ui/skeleton"
import type { Order, Message } from "@/types"

export default function StatsCards() {
  const [stats, setStats] = useState({ 
    totalOrders: 0, 
    processing: 0, 
    delivered: 0,
    totalMessages: 0,
    unreadMessages: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      
      // Fetch order stats
      const { data: orders, error: ordersError, count: ordersCount } = await supabase
        .from('orders')
        .select('order_status', { count: 'exact', head: false });

      // Fetch message stats - handle case where table doesn't exist
      let messagesCount = 0
      let unreadMessages: any[] = []
      
      const { data: messages, error: messagesError, count: messagesCountResult } = await supabase
        .from('messages')
        .select('status', { count: 'exact', head: false });

      if (ordersError) {
        console.error("Error fetching order stats:", ordersError)
      }
      
      if (messagesError) {
        console.error("Error fetching message stats:", messagesError)
        // Don't show error if it's just table doesn't exist
        if (!(messagesError.code === 'PGRST116' || messagesError.message?.includes('does not exist'))) {
          console.error("Unexpected message stats error:", messagesError)
        }
      } else {
        messagesCount = messagesCountResult ?? 0
        unreadMessages = messages?.filter(m => m.status === 'unread') || []
      }

      const processingOrders = orders?.filter(o => o.order_status !== 'delivered' && o.order_status !== 'cancelled') || [];
      const deliveredOrders = orders?.filter(o => o.order_status === 'delivered') || [];
      
      setStats({
        totalOrders: ordersCount ?? 0,
        processing: processingOrders.length,
        delivered: deliveredOrders.length,
        totalMessages: messagesCount,
        unreadMessages: unreadMessages.length
      })
      
      setLoading(false)
    }

    fetchStats()

    // Set up real-time subscriptions
    const ordersChannel = supabase
      .channel('orders-stats-realtime')
      .on<Order>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchStats()
      )
      .subscribe()

    const messagesChannel = supabase
      .channel('messages-stats-realtime')
      .on<Message>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => fetchStats()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(messagesChannel)
    }
  }, [])

  if (loading) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
        </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{stats.totalOrders}</div>
          <p className="text-xs text-muted-foreground">Total orders placed</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Processing</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{stats.processing}</div>
           <p className="text-xs text-muted-foreground">Orders in progress</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          <Send className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{stats.delivered}</div>
           <p className="text-xs text-muted-foreground">Successfully delivered</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Messages</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">{stats.totalMessages}</div>
          <p className="text-xs text-muted-foreground">Total customer messages</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unread</CardTitle>
          <Mail className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-red-500">{stats.unreadMessages}</div>
          <p className="text-xs text-muted-foreground">Need attention</p>
        </CardContent>
      </Card>
    </div>
  )
}
