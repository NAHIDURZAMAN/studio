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
import { Download, Mail, MapPin, Package, Phone, User, Hash, Edit } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

type OrderDetailsDialogProps = {
  order: Order | null
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void;
  onStatusChange: () => void;
}

export default function OrderDetailsDialog({ order, isOpen, onOpenChange, onStatusChange }: OrderDetailsDialogProps) {
  const [currentStatus, setCurrentStatus] = useState(order?.order_status);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

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
    alert("PDF download functionality will be implemented here.");
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Left Column */}
            <div className="space-y-4">
                <h4 className="font-semibold text-lg">Customer Info</h4>
                <div className="flex items-start gap-3">
                    <User className="w-4 h-4 mt-1 text-muted-foreground" />
                    <span>{order.customer_name}</span>
                </div>
                <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 mt-1 text-muted-foreground" />
                    <span>{order.customer_email}</span>
                </div>
                 <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div>
                      <p>{order.customer_phone} <Badge variant="outline" className="text-xs">WhatsApp</Badge></p>
                      {order.secondary_phone && <p>{order.secondary_phone} <Badge variant="outline" className="text-xs">Secondary</Badge></p>}
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                    <p className="whitespace-pre-wrap">{order.customer_address}</p>
                </div>
            </div>

             {/* Right Column */}
             <div className="space-y-4">
                <h4 className="font-semibold text-lg">Order Summary</h4>
                 <div className="flex justify-between items-center">
                    <span>{order.products?.name || 'Product'} x {order.quantity}</span>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">{order.size}</Badge>
                        <span className="font-semibold">৳{order.total_price.toLocaleString()}</span>
                    </div>
                 </div>
                <Separator />
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
                 <h4 className="font-semibold text-lg pt-2">Status</h4>
                 <div className="flex items-center gap-4">
                    <Select defaultValue={currentStatus} onValueChange={(val) => setCurrentStatus(val as Order['order_status'])}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                           {orderStatuses.map(status => (
                             <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                           ))}
                        </SelectContent>
                    </Select>
                     <Button onClick={handleStatusUpdate} disabled={isUpdating || currentStatus === order.order_status}>
                        {isUpdating ? "Saving..." : "Save"}
                     </Button>
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
