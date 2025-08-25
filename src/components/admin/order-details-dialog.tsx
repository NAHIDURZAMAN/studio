"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Order } from "@/types"
import { Badge } from "../ui/badge"
import { format } from "date-fns"
import { Separator } from "../ui/separator"
import { Download, Mail, MapPin, Package, Phone, User, Eye, Edit, Save, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useState, useRef, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import InvoiceTemplate from "./invoice-template"
import Image from "next/image"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"

type OrderDetailsDialogProps = {
  order: Order | null
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void;
  onStatusChange: () => void;
}

export default function OrderDetailsDialog({ order, isOpen, onOpenChange, onStatusChange }: OrderDetailsDialogProps) {
  const [currentStatus, setCurrentStatus] = useState(order?.order_status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [productDetails, setProductDetails] = useState<any>(null);
  const { toast } = useToast();
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (order) {
      setCurrentStatus(order.order_status);
      
      // Fetch product details with images
      fetchProductDetails(order.product_id);
    }
  }, [order]);

  const fetchProductDetails = async (productId: number) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (!error && data) {
      setProductDetails(data);
    }
  };

  if (!order) return null;

  const handleStatusUpdate = async () => {
    if (!currentStatus || currentStatus === order.order_status) return;

    setIsUpdating(true);
    const { error } = await supabase
      .from('orders')
      .update({ order_status: currentStatus })
      .eq('id', order.id);
    
    setIsUpdating(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update the order status. Please try again.",
      });
    } else {
      toast({
        title: "Status Updated",
        description: `Order ${order.order_id} has been updated to "${currentStatus}".`,
      });
      onStatusChange(); // Refetch orders
      onOpenChange(false); // Close dialog
    }
  };

  const handleDownload = () => {
    const input = invoiceRef.current;
    if (input) {
      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`invoice-${order.order_id}.pdf`);
      });
    }
  }

  const orderStatuses: Order['order_status'][] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-6 h-6"/> 
            Order Details
          </DialogTitle>
          <DialogDescription>
             Order ID: <span className="font-mono font-semibold">{order.order_id}</span>
             <span className="mx-2">|</span>
             {format(new Date(order.created_at), 'PPP, p')}
          </DialogDescription>
        </DialogHeader>
        
        {/* This div is for PDF generation only, it won't be visible */}
        <div className="absolute -z-10 -left-[9999px] -top-[9999px]">
          <div ref={invoiceRef}>
            <InvoiceTemplate order={order} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Left Column - Customer Info (Read Only) */}
            <div className="space-y-4">
                <h4 className="font-semibold text-lg">Customer Info</h4>

                <div className="flex items-start gap-3">
                    <User className="w-4 h-4 mt-1 text-muted-foreground" />
                    <span>{order.customer_name}</span>
                </div>
                <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 mt-1 text-muted-foreground" />
                    <span>{order.customer_phone}</span>
                </div>
                <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 mt-1 text-muted-foreground" />
                    <span>{order.customer_email}</span>
                </div>
                <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                    <p className="whitespace-pre-wrap">{order.customer_address}</p>
                </div>
            </div>

             {/* Right Column - Product Info & Status */}
             <div className="space-y-4">
                <h4 className="font-semibold text-lg">Product & Order Details</h4>
                
                {/* Product Images */}
                {productDetails?.images && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Product Images
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {productDetails.images.slice(0, 4).map((image: string, index: number) => (
                                <div key={index} className="aspect-square relative border rounded-lg overflow-hidden">
                                    <Image
                                        src={image}
                                        alt={`Product image ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Order Details */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span>{order.products?.name || 'Product'}</span>
                        <span className="font-semibold">৳{order.total_price.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div>
                            <label className="text-sm font-medium">Quantity</label>
                            <Badge variant="secondary" className="ml-2">{order.quantity}</Badge>
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium">Size</label>
                            <Badge variant="secondary" className="ml-2">{order.size}</Badge>
                        </div>
                    </div>
                </div>

                <Separator />
                
                {/* Payment & Delivery Info */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Payment Method</span>
                        <span className="font-medium uppercase">{order.payment_method}</span>
                    </div>
                    {order.payment_method !== 'cod' && (
                        <div className="flex justify-between text-sm">
                           <span className="text-muted-foreground">Transaction ID</span>
                           <span className="font-mono text-xs">{order.transaction_id || 'N/A'}</span>
                        </div>
                    )}
                     <div className="flex justify-between text-sm">
                           <span className="text-muted-foreground">Delivery Location</span>
                           <span className="capitalize">{order.delivery_location || 'N/A'}</span>
                        </div>
                     <div className="flex justify-between text-sm">
                           <span className="text-muted-foreground">Delivery Charge</span>
                           <span>৳{order.delivery_charge.toLocaleString()}</span>
                        </div>
                </div>
                
                <Separator />
                
                {/* Status Update */}
                <div className="space-y-3">
                    <h4 className="font-semibold">Order Status</h4>
                    <div className="flex items-center gap-2">
                        <Select value={currentStatus} onValueChange={(val) => setCurrentStatus(val as Order['order_status'])}>
                            <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Update status" />
                            </SelectTrigger>
                            <SelectContent>
                               {orderStatuses.map(status => (
                                 <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                               ))}
                            </SelectContent>
                        </Select>
                        <Button 
                            onClick={handleStatusUpdate} 
                            disabled={isUpdating || currentStatus === order.order_status}
                            size="sm"
                        >
                            {isUpdating ? "Saving..." : "Update"}
                        </Button>
                    </div>
                </div>
             </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download Invoice
          </Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
