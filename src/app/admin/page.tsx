"use client"

import AdminAuthGuard from "@/components/admin/admin-auth-guard"
import AddProductForm from "@/components/admin/add-product-form"
import DownloadOrdersView from "@/components/admin/download-orders-view"
import OrdersView from "@/components/admin/orders-view"
import ProductsView from "@/components/admin/products-view"
import StatsCards from "@/components/admin/stats-cards"
import Navbar from "@/components/navbar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CustomOrdersView from "@/components/admin/custom-orders-view"

export default function AdminPage() {
  return (
    <AdminAuthGuard>
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold font-headline mb-6">Admin Dashboard</h1>
        
        <StatsCards />

        <Tabs defaultValue="orders" className="mt-8">
          <TabsList className="grid w-full max-w-xl grid-cols-2 md:grid-cols-5 h-auto">
            <TabsTrigger value="orders">View Orders</TabsTrigger>
            <TabsTrigger value="custom-orders">Custom Orders</TabsTrigger>
            <TabsTrigger value="add-product">Add Product</TabsTrigger>
            <TabsTrigger value="view-products">View Products</TabsTrigger>
            <TabsTrigger value="order-history">Order History</TabsTrigger>
          </TabsList>
          <TabsContent value="orders">
            <OrdersView />
          </TabsContent>
          <TabsContent value="custom-orders">
            <CustomOrdersView />
          </TabsContent>
          <TabsContent value="add-product">
            <AddProductForm />
          </TabsContent>
           <TabsContent value="view-products">
            <ProductsView />
          </TabsContent>
           <TabsContent value="order-history">
            <DownloadOrdersView />
          </TabsContent>
        </Tabs>
      </main>
    </AdminAuthGuard>
  )
}
