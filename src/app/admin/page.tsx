"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OrdersView from "@/components/admin/orders-view"
import AddProductForm from "@/components/admin/add-product-form"
import Navbar from "@/components/navbar"
import { Skeleton } from "@/components/ui/skeleton"
import DownloadOrdersView from "@/components/admin/download-orders-view"

const adminEmails = ["nahidurzaman1903@gmail.com", "sakifshahrear@gmail.com"];

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user && adminEmails.includes(session.user.email ?? '')) {
        setIsAdmin(true);
      } else {
        router.push('/admin/login');
      }
      setLoading(false);
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md p-8">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null; // or a redirect component
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold font-headline mb-6">Admin Dashboard</h1>
        <Tabs defaultValue="orders">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="orders">View Orders</TabsTrigger>
            <TabsTrigger value="add-product">Add Product</TabsTrigger>
            <TabsTrigger value="order-history">Order History</TabsTrigger>
          </TabsList>
          <TabsContent value="orders">
            <OrdersView />
          </TabsContent>
          <TabsContent value="add-product">
            <AddProductForm />
          </TabsContent>
           <TabsContent value="order-history">
            <DownloadOrdersView />
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}
