"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OrdersView from "@/components/admin/orders-view"
import AddProductForm from "@/components/admin/add-product-form"
import Navbar from "@/components/navbar"

export default function AdminPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold font-headline mb-6">Admin Dashboard</h1>
        <Tabs defaultValue="orders">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="orders">View Orders</TabsTrigger>
            <TabsTrigger value="add-product">Add Product</TabsTrigger>
          </TabsList>
          <TabsContent value="orders">
            <OrdersView />
          </TabsContent>
          <TabsContent value="add-product">
            <AddProductForm />
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}
