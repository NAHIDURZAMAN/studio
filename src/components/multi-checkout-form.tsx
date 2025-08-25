"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Separator } from "./ui/separator"
import { Banknote, CreditCard, Smartphone, Truck } from "lucide-react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { supabase } from "@/lib/supabase"
import { Checkbox } from "./ui/checkbox"
import { useCart } from "@/contexts/cart-context"

const multiCheckoutSchema = z.object({
  name: z.string().min(2, "Name is required."),
  phone: z.string().regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, "Invalid Bangladeshi phone number."),
  secondary_phone: z.string().optional(),
  email: z.string().email("A valid email address is required."),
  address: z.string().min(10, "Full address is required."),
  paymentMethod: z.enum(['cod', 'bkash', 'nagad', 'trust', 'brac'], { required_error: "Please select a payment method." }),
  deliveryLocation: z.enum(['dhaka', 'outside'], { required_error: "Please select delivery location." }),
  transactionId: z.string().optional(),
  paymentConfirmation: z.boolean(),
}).refine(data => {
  if (data.paymentMethod !== 'cod' && (!data.transactionId || data.transactionId.trim().length < 5)) {
    return false;
  }
  return true;
}, {
  message: "A valid Transaction ID is required for this payment method.",
  path: ["transactionId"],
}).refine(data => {
  if (data.paymentMethod !== 'cod') {
    return data.paymentConfirmation === true;
  }
  return true;
}, {
  message: "Please confirm your payment.",
  path: ["paymentConfirmation"],
});

type MultiCheckoutFormProps = {
  onSuccess: () => void;
};

export default function MultiCheckoutForm({ onSuccess }: MultiCheckoutFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { 
    items, 
    getTotalPrice, 
    getDeliveryCharge, 
    getGrandTotal,
    clearCart 
  } = useCart();

  const form = useForm<z.infer<typeof multiCheckoutSchema>>({
    resolver: zodResolver(multiCheckoutSchema),
    defaultValues: {
      paymentConfirmation: false,
      deliveryLocation: 'dhaka',
    },
  });

  const paymentMethod = form.watch("paymentMethod");
  const deliveryLocation = form.watch("deliveryLocation");

  const subtotal = getTotalPrice();
  const deliveryCharge = getDeliveryCharge(deliveryLocation);
  const total = getGrandTotal(deliveryLocation, paymentMethod);

  const handlePaymentMethodChange = (value: string) => {
    form.setValue("paymentMethod", value as any, { shouldValidate: true });
    form.setValue("paymentConfirmation", false);
    if (value === 'cod') {
      form.setValue("transactionId", "");
    }
  };

  function generateOrderId(address: string): string {
    const timestamp = Date.now().toString();
    const addressHash = address.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return `XS${timestamp.slice(-6)}${Math.abs(addressHash).toString().slice(-3)}`;
  }

  async function onSubmit(values: z.infer<typeof multiCheckoutSchema>) {
    if (items.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Cart Empty',
        description: 'Your cart is empty. Please add some products before checkout.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = generateOrderId(values.address);

      // Create order items array for multiple products
      const orderItems = items.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        size: item.size,
        quantity: item.quantity,
        unit_price: item.selected_price,
        subtotal: item.selected_price * item.quantity
      }));

      const orderData = {
        order_id: orderId,
        items: orderItems, // Array of products
        total_items: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: subtotal,
        delivery_charge: deliveryCharge, // Always include delivery charges
        total_price: total,
        customer_name: values.name,
        customer_phone: values.phone,
        secondary_phone: values.secondary_phone,
        customer_email: values.email,
        customer_address: values.address,
        payment_method: values.paymentMethod,
        delivery_location: values.deliveryLocation,
        transaction_id: values.transactionId,
        order_status: 'pending',
        created_at: new Date().toISOString(),
      };

      console.log('Creating multi-product order:', orderData);

      // Insert into orders table (you may need to update the database schema)
      const { error } = await supabase.from('multi_orders').insert([orderData]);

      if (error) {
        console.error('Error creating multi-order:', error);
        throw error;
      }

      toast({
        title: 'Order Placed Successfully! 🎉',
        description: `Your order #${orderId} has been placed. We'll contact you soon!`,
      });

      // Clear the cart after successful order
      clearCart();
      onSuccess();

    } catch (error: any) {
      console.error('Order submission error:', error);
      toast({
        variant: 'destructive',
        title: 'Order Failed',
        description: error.message || 'There was a problem placing your order. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Your cart is empty</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Order Summary */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Order Summary</h3>
          {items.map((item) => (
            <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="aspect-square w-12 relative rounded overflow-hidden">
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-grow text-sm">
                <p className="font-medium">{item.product.name}</p>
                <p className="text-muted-foreground">Size: {item.size} × {item.quantity}</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">৳{(item.selected_price * item.quantity).toLocaleString()}</p>
                {item.selected_price < item.product.price && (
                  <p className="text-xs text-muted-foreground line-through">
                    ৳{(item.product.price * item.quantity).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Customer Information</h3>
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="01XXXXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secondary_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secondary Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="01XXXXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="your@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Address</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter your complete delivery address..." 
                    className="resize-none" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deliveryLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Location</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivery location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="dhaka">Inside Dhaka (৳70)</SelectItem>
                    <SelectItem value="outside">Outside Dhaka (৳120)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Payment Method */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Payment Method</h3>
          
          <Tabs value={paymentMethod} onValueChange={handlePaymentMethodChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="cod" className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span className="hidden sm:inline">Cash on Delivery</span>
                <span className="sm:hidden">COD</span>
              </TabsTrigger>
              <TabsTrigger value="bkash" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                bKash
              </TabsTrigger>
              <TabsTrigger value="nagad" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Nagad
              </TabsTrigger>
              <TabsTrigger value="trust" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Trust
              </TabsTrigger>
              <TabsTrigger value="brac" className="flex items-center gap-2">
                <Banknote className="w-4 h-4" />
                BRAC
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cod" className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Cash on Delivery</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Pay when you receive your order. Delivery charge: ৳{deliveryCharge}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* bKash Payment Method */}
            <TabsContent value="bkash" className="space-y-4">
              <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                <div className="flex items-center gap-3 mb-3">
                  <Image 
                    src="/assets/bkash.png" 
                    alt="bKash"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                  <h4 className="font-medium text-pink-900">bKash Payment</h4>
                </div>
                <p className="text-sm text-pink-700 mb-3">
                  Please send ৳{total.toLocaleString()} to the following number and enter the Transaction ID below.
                </p>
                <div className="bg-white p-3 rounded border mb-4">
                  <p className="text-sm font-medium">bKash Personal</p>
                  <p className="text-lg font-mono">01677343504</p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="transactionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction ID *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter transaction ID..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentConfirmation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I confirm that I have sent the payment
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            {/* Nagad Payment Method */}
            <TabsContent value="nagad" className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <Image 
                    src="/assets/nagad.png" 
                    alt="Nagad"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                  <h4 className="font-medium text-green-900">Nagad Payment</h4>
                </div>
                <p className="text-sm text-green-700 mb-3">
                  Please send ৳{total.toLocaleString()} to the following number and enter the Transaction ID below.
                </p>
                <div className="bg-white p-3 rounded border mb-4">
                  <p className="text-sm font-medium">Nagad Personal</p>
                  <p className="text-lg font-mono">01521753739</p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="transactionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction ID *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter transaction ID..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentConfirmation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I confirm that I have sent the payment
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            {/* Trust Bank Payment Method */}
            <TabsContent value="trust" className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <Image 
                    src="/assets/trust.png" 
                    alt="Trust Bank"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                  <h4 className="font-medium text-blue-900">Trust Bank</h4>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Please send ৳{total.toLocaleString()} to the following account and enter the Transaction ID below.
                </p>
                <div className="bg-white p-3 rounded border mb-4">
                  <p className="text-sm font-medium">Trust Bank Account</p>
                  <p className="text-lg font-mono">4181171800860910</p>
                  <p className="text-sm text-muted-foreground">Account Name: X Style</p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="transactionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction ID *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter transaction ID..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentConfirmation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I confirm that I have sent the payment
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            {/* BRAC Bank Payment Method */}
            <TabsContent value="brac" className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3 mb-3">
                  <Image 
                    src="/assets/brac.png" 
                    alt="BRAC Bank"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                  <h4 className="font-medium text-orange-900">BRAC Bank</h4>
                </div>
                <p className="text-sm text-orange-700 mb-3">
                  Please send ৳{total.toLocaleString()} to the following account and enter the Transaction ID below.
                </p>
                <div className="bg-white p-3 rounded border mb-4">
                  <p className="text-sm font-medium">BRAC Bank Account</p>
                  <p className="text-lg font-mono">4777920800299481</p>
                  <p className="text-sm text-muted-foreground">Account Name: X Style</p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="transactionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction ID *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter transaction ID..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentConfirmation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I confirm that I have sent the payment
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>
        </div>

        <Separator />

        {/* Order Total */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
            <span>৳ {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery Charge</span>
            <span>৳ {deliveryCharge.toLocaleString()}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">৳ {total.toLocaleString()}</span>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
          size="lg"
        >
          {isSubmitting ? 'Placing Order...' : `Place Order - ৳${total.toLocaleString()}`}
        </Button>
      </form>
    </Form>
  )
}
