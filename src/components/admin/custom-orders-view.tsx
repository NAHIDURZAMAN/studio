
"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { CustomOrder } from "@/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { format } from 'date-fns'
import { Skeleton } from "../ui/skeleton"
import Image from "next/image"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function CustomOrdersView() {
  const [orders, setOrders] = useState<CustomOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null)
  const { toast } = useToast()

  const fetchCustomOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("custom_orders")
      .select(`*`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching custom orders:", error)
      setOrders([])
    } else {
      setOrders(data)
    }
    setLoading(false);
  }, [])

  useEffect(() => {
    fetchCustomOrders()
    
    const channel = supabase
      .channel('custom-orders-realtime-channel')
      .on<CustomOrder>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'custom_orders' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setOrders(currentOrders =>
              currentOrders.map(order =>
                order.id === payload.new.id ? { ...order, ...(payload.new as CustomOrder) } : order
              )
            );
          } else {
            fetchCustomOrders();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCustomOrders])

  const handleStatusChange = async (orderId: number, newStatus: CustomOrder['status']) => {
      const { error } = await supabase
        .from('custom_orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) {
          toast({
              title: "Error updating status",
              description: error.message,
              variant: "destructive"
          })
      } else {
          toast({
              title: "Status Updated!",
              description: `Order status changed to ${newStatus}.`
          })
      }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Custom Design Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
             <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }
  
  if (orders.length === 0) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>Custom Design Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No custom orders have been submitted yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Custom Design Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Design Count</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow 
                    key={order.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedOrder(order)}
                >
                  <TableCell>{format(new Date(order.created_at), 'PPp')}</TableCell>
                  <TableCell>
                      <div className="font-medium">{order.customer_name}</div>
                      <div>{order.customer_phone}</div>
                  </TableCell>
                  <TableCell>{order.customer_address}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.designs.length} Design(s)</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge>{order.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedOrder && (
         <Dialog open={!!selectedOrder} onOpenChange={(isOpen) => !isOpen && setSelectedOrder(null)}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Order from {selectedOrder.customer_name}</DialogTitle>
                    <DialogDescription>
                        {selectedOrder.customer_phone} | Submitted on {format(new Date(selectedOrder.created_at), 'PPp')}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold">Status</h4>
                         <Select
                            defaultValue={selectedOrder.status}
                            onValueChange={(newStatus) => handleStatusChange(selectedOrder.id, newStatus as CustomOrder['status'])}
                         >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Change status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending_review">Pending Review</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="in_production">In Production</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                    {selectedOrder.designs.map((design, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>Design {index + 1}</AccordionTrigger>
                            <AccordionContent>
                               <div className="flex flex-col md:flex-row gap-4 items-start">
                                 <a href={design.design_url} target="_blank" rel="noopener noreferrer" className="w-full md:w-1/3">
                                    <Image src={design.design_url} alt={`Design ${index+1}`} width={150} height={150} className="rounded-md object-cover border w-full aspect-square" />
                                 </a>
                                 <div className="w-full md:w-2/3">
                                     <h5 className="font-semibold mb-2">Instructions:</h5>
                                     <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-md whitespace-pre-wrap">
                                        {design.instructions || "No instructions provided."}
                                     </p>
                                 </div>
                               </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
                </DialogFooter>
            </DialogContent>
         </Dialog>
      )}
    </>
  )
}
