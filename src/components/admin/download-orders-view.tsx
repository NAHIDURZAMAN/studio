"use client"

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/lib/supabase';
import type { Order } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { DownloadCloud } from 'lucide-react';
import { format } from 'date-fns';

export default function DownloadOrdersView() {
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setLoading(true);
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`*, products(name)`)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }
      
      if (!orders || orders.length === 0) {
        toast({
            variant: "default",
            title: "No Orders Found",
            description: "There are no orders to download.",
        });
        return;
      }

      // We have to cast `any` here because the joined `products` table creates a nested object
      const typedOrders = orders as any as Order[];

      const csvContent = generateCsv(typedOrders);
      downloadCsv(csvContent);

      toast({
        title: "Download Started",
        description: "Your order history is being downloaded as a CSV file.",
      });

    } catch (error: any) {
      console.error("Error downloading orders:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
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

  const downloadCsv = (csvContent: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `xstyle_order_history_${new Date().toISOString().split('T')[0]}.csv`);
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
          Download a complete history of all orders as a CSV file. This can be opened in any spreadsheet software like Excel or Google Sheets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleDownload} disabled={loading}>
            <DownloadCloud className="mr-2 h-4 w-4" />
            {loading ? 'Generating...' : 'Download All Orders (CSV)'}
        </Button>
      </CardContent>
    </Card>
  );
}
