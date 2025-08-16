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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/types"
import { useState } from "react"
import { Separator } from "./ui/separator"
import { Banknote, CreditCard, Minus, Plus, Smartphone, Truck } from "lucide-react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { supabase } from "@/lib/supabase"
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"

const checkoutSchema = z.object({
  name: z.string().min(2, "Name is required."),
  phone: z.string().regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, "Invalid Bangladeshi phone number."),
  secondary_phone: z.string().optional(),
  email: z.string().email("A valid email address is required."),
  address: z.string().min(10, "Full address is required."),
  size: z.string({ required_error: "Please select a size."}),
  paymentMethod: z.enum(['cod', 'bkash', 'nagad', 'trust', 'brac'], { required_error: "Please select a payment method." }),
  deliveryLocation: z.enum(['dhaka', 'outside'], { required_error: "Please select delivery location." }).optional(),
  transactionId: z.string().optional(),
}).refine(data => {
  if (data.paymentMethod !== 'cod' && (!data.transactionId || data.transactionId.trim().length < 5)) {
    return false;
  }
  return true;
}, {
  message: "A valid Transaction ID is required for this payment method.",
  path: ["transactionId"],
}).refine(data => {
    if (data.paymentMethod === 'cod' && !data.deliveryLocation) {
        return false;
    }
    return true;
}, {
    message: "Please select a delivery location for Cash on Delivery.",
    path: ["deliveryLocation"],
});


type CheckoutFormProps = {
  product: Product;
  onSuccess: () => void;
};

export default function CheckoutForm({ product, onSuccess }: CheckoutFormProps) {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  
  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      transactionId: "",
      secondary_phone: "",
    },
  });

  const paymentMethod = form.watch("paymentMethod");
  const deliveryLocation = form.watch("deliveryLocation");
  
  const deliveryCharge = deliveryLocation === 'dhaka' ? 70 : deliveryLocation === 'outside' ? 120 : 0;
  const subtotal = product.price * quantity;
  const total = subtotal + (paymentMethod === 'cod' ? deliveryCharge : 0);
  
  const handlePaymentMethodChange = (value: string) => {
    form.setValue("paymentMethod", value as any, { shouldValidate: true });
    if (value === 'cod') {
        form.setValue("transactionId", "");
    } else {
        form.setValue("deliveryLocation", undefined);
    }
  }

  const handleTabChange = (tab: string) => {
    if (tab === 'cod') {
        handlePaymentMethodChange('cod');
    } else if (tab === 'mobile') {
        handlePaymentMethodChange('bkash');
    } else if (tab === 'card') {
        handlePaymentMethodChange('trust');
    }
  }

  const generateOrderId = (address: string) => {
    const addressPrefix = address.substring(0, 3).toUpperCase();
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `X_${addressPrefix}${randomNumber}`;
  }


  async function onSubmit(values: z.infer<typeof checkoutSchema>) {
    const orderId = generateOrderId(values.address);

    const orderData = {
        order_id: orderId,
        product_id: product.id,
        quantity,
        total_price: total,
        delivery_charge: paymentMethod === 'cod' ? deliveryCharge : 0,
        customer_name: values.name,
        customer_phone: values.phone,
        secondary_phone: values.secondary_phone,
        customer_email: values.email,
        customer_address: values.address,
        payment_method: values.paymentMethod,
        delivery_location: values.deliveryLocation,
        transaction_id: values.transactionId,
        order_status: 'pending',
        size: values.size,
    };

    const { error } = await supabase.from('orders').insert([orderData]);

    if (error) {
        console.error('Error creating order:', error);
        toast({
            variant: 'destructive',
            title: 'Order Failed',
            description: 'There was a problem placing your order. Please try again.',
        });
    } else {
        toast({
          title: "🎉 Order Placed!",
          description: "Your X STYLE order is confirmed. We'll be in touch shortly!",
        });
        onSuccess();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
            <h3 className="text-lg font-medium font-headline">{product.name}</h3>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => Math.max(1, q-1))}><Minus className="h-4 w-4" /></Button>
                    <span className="text-lg font-bold w-4 text-center">{quantity}</span>
                    <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => q+1)}><Plus className="h-4 w-4" /></Button>
                </div>
                <p className="text-2xl font-bold font-headline text-primary">৳ {subtotal.toLocaleString()}</p>
            </div>
        </div>
        <Separator/>

        <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
                <FormItem className="space-y-3">
                <FormLabel>Select Size</FormLabel>
                <FormControl>
                    <ToggleGroup 
                        type="single" 
                        onValueChange={field.onChange}
                        value={field.value}
                        variant="outline"
                        className="flex flex-wrap justify-start"
                    >
                        {product.sizes.map(size => (
                            <ToggleGroupItem key={size} value={size} aria-label={`Toggle ${size}`}>
                                {size}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (WhatsApp)</FormLabel>
              <FormControl>
                <Input placeholder="01xxxxxxxxx" {...field} />
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
              <FormLabel>Secondary Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Another contact number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
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
                <Textarea placeholder="Include house, road, area, and city" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
                <FormLabel>Payment Method</FormLabel>
                 <Tabs defaultValue="cod" className="w-full" onValueChange={handleTabChange}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="cod"><Truck className="w-4 h-4 mr-2" />COD</TabsTrigger>
                        <TabsTrigger value="mobile"><Smartphone className="w-4 h-4 mr-2"/>Mobile</TabsTrigger>
                        <TabsTrigger value="card"><CreditCard className="w-4 h-4 mr-2"/>Card/Bank</TabsTrigger>
                    </TabsList>
                    <TabsContent value="cod" className="mt-4">
                        <div className="bg-secondary p-4 rounded-md">
                           <p className="text-sm text-secondary-foreground">Pay with cash upon delivery.</p>
                        </div>
                        <FormField
                            control={form.control}
                            name="deliveryLocation"
                            render={({ field: deliveryField }) => (
                            <FormItem className="pt-4">
                                <FormLabel>Delivery Location</FormLabel>
                                <Select onValueChange={deliveryField.onChange} defaultValue={deliveryField.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Select where to deliver" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="dhaka">Inside Dhaka</SelectItem>
                                    <SelectItem value="outside">Outside Dhaka</SelectItem>
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </TabsContent>
                    <TabsContent value="mobile" className="mt-4">
                        <RadioGroup onValueChange={handlePaymentMethodChange} value={paymentMethod} className="grid grid-cols-1 gap-4">
                            <div className="bg-secondary p-4 rounded-md">
                                <p className="text-sm text-secondary-foreground">Please send ৳{subtotal.toLocaleString()} to one of the following numbers and enter the Transaction ID below.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md has-[:checked]:border-primary">
                                    <FormControl>
                                        <RadioGroupItem value="bkash" id="bkash" />
                                    </FormControl>
                                    <FormLabel htmlFor="bkash" className="font-normal w-full">
                                        <Image src="/assets/bkash.svg" alt="bKash" width={60} height={20}/>
                                    </FormLabel>
                                </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md has-[:checked]:border-primary">
                                    <FormControl>
                                        <RadioGroupItem value="nagad" id="nagad" />
                                    </FormControl>
                                    <FormLabel htmlFor="nagad" className="font-normal w-full">
                                        <Image src="/assets/nagad.svg" alt="Nagad" width={80} height={20}/>
                                    </FormLabel>
                                </FormItem>
                            </div>
                                <FormField
                                    control={form.control}
                                    name="transactionId"
                                    render={({ field: trxField }) => (
                                        <FormItem>
                                        <FormLabel>Transaction ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your TrxID here" {...trxField} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                        </RadioGroup>
                    </TabsContent>
                    <TabsContent value="card" className="mt-4">
                         <RadioGroup onValueChange={handlePaymentMethodChange} value={paymentMethod} className="grid grid-cols-1 gap-4">
                            <div className="bg-secondary p-4 rounded-md">
                                <p className="text-sm text-secondary-foreground">Please send ৳{subtotal.toLocaleString()} to one of the following accounts and enter the Transaction ID below.</p>
                            </div>
                           <div className="grid grid-cols-2 gap-4">
                                <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md has-[:checked]:border-primary">
                                    <FormControl>
                                        <RadioGroupItem value="trust" id="trust" />
                                    </FormControl>
                                    <FormLabel htmlFor="trust" className="font-normal w-full">
                                       <Image src="/assets/trust.svg" alt="Trust Bank" width={80} height={20}/>
                                    </FormLabel>
                                </FormItem>
                                 <FormItem className="flex items-center space-x-3 space-y-0 p-3 border rounded-md has-[:checked]:border-primary">
                                    <FormControl>
                                        <RadioGroupItem value="brac" id="brac" />
                                    </FormControl>
                                    <FormLabel htmlFor="brac" className="font-normal w-full">
                                        <Image src="/assets/brac.svg" alt="BRAC Bank" width={80} height={20}/>
                                    </FormLabel>
                                </FormItem>
                            </div>
                            <FormField
                                control={form.control}
                                name="transactionId"
                                render={({ field: trxField }) => (
                                    <FormItem>
                                    <FormLabel>Transaction ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your TrxID here" {...trxField} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </RadioGroup>
                    </TabsContent>
                </Tabs>
                <FormMessage>{form.formState.errors.paymentMethod?.message}</FormMessage>
            </FormItem>
        )}
        />
        

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>৳ {subtotal.toLocaleString()}</span>
            </div>
            {paymentMethod === 'cod' && deliveryCharge > 0 && (
                 <div className="flex justify-between text-sm">
                    <span>Delivery Charge</span>
                    <span>৳ {deliveryCharge.toLocaleString()}</span>
                </div>
            )}
             <Separator/>
             <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>৳ {total.toLocaleString()}</span>
            </div>
        </div>

        <Button type="submit" className="w-full text-lg py-6" disabled={form.formState.isSubmitting}>
            <Banknote className="mr-2 h-5 w-5"/>
            Confirm Order
        </Button>
      </form>
    </Form>
  )
}
