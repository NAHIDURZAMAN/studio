"use client"

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/lib/supabase';
import type { Order } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { DownloadCloud, Package, PackageCheck, Send, Ban, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const orderStatuses: { status: Order['order_status']; icon: React.ElementType; label: string }[] = [
    { status: 'pending', icon: Package, label: 'Pending Orders' },
    { status: 'confirmed', icon: CheckCircle, label: 'Confirmed Orders' },
    { status: 'shipped', icon: Send, label: 'Shipped Orders' },
    { status: 'delivered', icon: PackageCheck, label: 'Delivered Orders' },
    { status: 'cancelled', icon: Ban, label: 'Cancelled Orders' },
];

export default function DownloadOrdersView() {
  const [loadingStatus, setLoadingStatus] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleDownload = async (status?: Order['order_status']) => {
    const currentStatusKey = status || 'all';
    setLoadingStatus(currentStatusKey);
    try {
      let query = supabase
        .from('orders')
        .select(`*, products(name)`)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('order_status', status);
      }

      const { data: orders, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }
      
      if (!orders || orders.length === 0) {
        toast({
            variant: "default",
            title: "No Orders Found",
            description: `There are no "${status || 'any'}" orders to download.`,
        });
        return;
      }

      // We have to cast `any` here because the joined `products` table creates a nested object
      const typedOrders = orders as any as Order[];

      const csvContent = generateCsv(typedOrders);
      const fileName = `xstyle_${currentStatusKey}_orders_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCsv(csvContent, fileName);

      toast({
        title: "Download Started",
        description: `Your ${currentStatusKey} order history is downloading.`,
      });

    } catch (error: any) {
      console.error("Error downloading orders:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setLoadingStatus(null);
    }
  };

  const generateCsv = (data: Order[]) => {
    const headers = [
      'OrderID', 'OrderDate', 'Status', 'CustomerName', 'CustomerPhone', 'CustomerSecondaryPhone', 
      'CustomerEmail', 'CustomerAddress', 'ProductName', 'Size', 'Quantity', 'ProductPrice',
      'DeliveryCharge', 'TotalPrice', 'PaymentMethod', 'TransactionID', 'DeliveryLocation'
    ];

    const rows = data.map(order => [
        order.order_id,
        format(new Date(order.created_at), 'yyyy-MM-dd HH:mm:ss'),
        order.order_status,
        order.customer_name,
        order.customer_phone,
        order.secondary_phone || '',
        order.customer_email,
        `"${order.customer_address.replace(/"/g, '""')}"`, // Escape quotes in address
        order.products?.name || 'N/A',
        order.size,
        order.quantity,
        (order.total_price - order.delivery_charge) / order.quantity, // Unit price
        order.delivery_charge,
        order.total_price,
        order.payment_method,
        order.transaction_id || '',
        order.delivery_location || '',
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  };

  const downloadCsv = (csvContent: string, fileName: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download Order History</CardTitle>
        <CardDescription>
          Download a complete history of all orders, or download orders filtered by their current status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             {orderStatuses.map(({ status, icon: Icon, label }) => (
                <Button key={status} onClick={() => handleDownload(status)} disabled={!!loadingStatus}>
                    <Icon className="mr-2 h-4 w-4" />
                    {loadingStatus === status ? 'Generating...' : `Download ${label}`}
                </Button>
            ))}
             <Button onClick={() => handleDownload()} disabled={!!loadingStatus} variant="secondary">
                <DownloadCloud className="mr-2 h-4 w-4" />
                {loadingStatus === 'all' ? 'Generating...' : 'Download All Orders'}
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
