"use client"

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/lib/supabase';
import type { Order } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { DownloadCloud, Package, PackageCheck, Send, Ban, CheckCircle, DollarSign, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '../ui/separator';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

const orderStatuses: { status: Order['order_status']; icon: React.ElementType; label: string }[] = [
    { status: 'pending', icon: Package, label: 'Pending Orders' },
    { status: 'confirmed', icon: CheckCircle, label: 'Confirmed Orders' },
    { status: 'shipped', icon: Send, label: 'Shipped Orders' },
    { status: 'delivered', icon: PackageCheck, label: 'Delivered Orders' },
    { status: 'cancelled', icon: Ban, label: 'Cancelled Orders' },
];

export default function DownloadOrdersView() {
  const [loadingStatus, setLoadingStatus] = React.useState<string | null>(null);
  const [totalRevenue, setTotalRevenue] = React.useState<number | null>(null);
  const [isCalculating, setIsCalculating] = React.useState(false);
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

      const typedOrders = orders as any[];

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

  const generateCsv = (data: (Order & { products: { name: string } | null })[]) => {
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
        `"${(order.customer_address || '').replace(/"/g, '""')}"`, // Escape quotes in address
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

   const handleCalculateRevenue = async () => {
    setIsCalculating(true);
    setTotalRevenue(null);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('total_price')
        .eq('order_status', 'delivered');

      if (error) {
        throw new Error(`Failed to fetch orders for revenue calculation: ${error.message}`);
      }

      if (!data || data.length === 0) {
        toast({
            title: "No Delivered Orders",
            description: "There are no delivered orders to calculate revenue from.",
        });
        setTotalRevenue(0);
        return;
      }

      const revenue = data.reduce((acc, order) => acc + order.total_price, 0);
      setTotalRevenue(revenue);
       toast({
        title: "Revenue Calculated",
        description: "Total revenue from delivered orders is now displayed.",
      });

    } catch (error: any) {
      console.error("Error calculating revenue:", error);
      toast({
        variant: "destructive",
        title: "Calculation Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className='space-y-6'>
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
                    {loadingStatus === status ? 'Generating...' : `${label}`}
                </Button>
            ))}
             <Button onClick={() => handleDownload()} disabled={!!loadingStatus} variant="secondary" className="lg:col-span-3">
                <DownloadCloud className="mr-2 h-4 w-4" />
                {loadingStatus === 'all' ? 'Generating...' : 'Download All Orders'}
            </Button>
        </div>
      </CardContent>
    </Card>

     <Card>
      <CardHeader>
        <CardTitle>Revenue Calculation</CardTitle>
        <CardDescription>
          Calculate the total revenue from all delivered orders.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleCalculateRevenue} disabled={isCalculating}>
          {isCalculating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <DollarSign className="mr-2 h-4 w-4" />
          )}
          {isCalculating ? 'Calculating...' : 'Calculate Total Revenue'}
        </Button>

        {totalRevenue !== null && (
          <Alert>
            <DollarSign className="h-4 w-4" />
            <AlertTitle>Total Revenue</AlertTitle>
            <AlertDescription className="text-2xl font-bold text-primary">
              ৳{totalRevenue.toLocaleString()}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
    </div>
  );
}
