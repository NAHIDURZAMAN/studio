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
import type { Product, CheckoutDetails } from "@/types"
import { useState } from "react"
import { Separator } from "./ui/separator"
import { Banknote, Minus, Plus } from "lucide-react"

const checkoutSchema = z.object({
  name: z.string().min(2, "Name is required."),
  phone: z.string().regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, "Invalid Bangladeshi phone number."),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  address: z.string().min(10, "Full address is required."),
  deliveryLocation: z.enum(['dhaka', 'outside'], { required_error: "Please select delivery location." }),
  paymentMethod: z.enum(['cod', 'bkash', 'nagad', 'trust', 'brac'], { required_error: "Please select a payment method." }),
  transactionId: z.string().optional(),
}).refine(data => {
  if (data.paymentMethod !== 'cod' && (!data.transactionId || data.transactionId.trim().length < 5)) {
    return false;
  }
  return true;
}, {
  message: "A valid Transaction ID is required for this payment method.",
  path: ["transactionId"],
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
    },
  });

  const paymentMethod = form.watch("paymentMethod");
  const deliveryLocation = form.watch("deliveryLocation");
  
  const deliveryCharge = deliveryLocation === 'dhaka' ? 70 : deliveryLocation === 'outside' ? 120 : 0;
  const subtotal = product.price * quantity;
  const total = subtotal + (paymentMethod === 'cod' ? deliveryCharge : 0);

  function onSubmit(values: z.infer<typeof checkoutSchema>) {
    console.log({ ...values, quantity, total });
    toast({
      title: "🎉 Order Placed!",
      description: "Your X STYLE order is confirmed. We'll be in touch shortly!",
    });
    onSuccess();
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
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="01xxxxxxxxx" {...field} />
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
              <FormLabel>Email (Optional)</FormLabel>
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
            <FormItem className="space-y-3">
              <FormLabel>Payment Method</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-2 gap-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="cod" />
                    </FormControl>
                    <FormLabel className="font-normal">Cash on Delivery</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="bkash" />
                    </FormControl>
                    <FormLabel className="font-normal">bKash</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="nagad" />
                    </FormControl>
                    <FormLabel className="font-normal">Nagad</FormLabel>
                  </FormItem>
                   <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="trust" />
                    </FormControl>
                    <FormLabel className="font-normal">Trust Bank</FormLabel>
                  </FormItem>
                   <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="brac" />
                    </FormControl>
                    <FormLabel className="font-normal">BRAC Bank</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {paymentMethod === 'cod' && (
            <FormField
                control={form.control}
                name="deliveryLocation"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Delivery Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        )}

        {paymentMethod && paymentMethod !== 'cod' && (
            <div className="bg-secondary p-4 rounded-md">
                <p className="font-semibold text-secondary-foreground mb-2">Payment Instructions:</p>
                <p className="text-sm text-secondary-foreground">Please send ৳{subtotal.toLocaleString()} to one of the following numbers and enter the Transaction ID below.</p>
                <ul className="text-sm list-disc pl-5 mt-2 font-mono text-muted-foreground">
                    <li>bKash: 01677343504</li>
                    <li>Nagad: 01521753739</li>
                    <li>Trust Bank: 4181171800860910</li>
                    <li>BRAC Bank: 4777920800299481</li>
                </ul>
                <FormField
                    control={form.control}
                    name="transactionId"
                    render={({ field }) => (
                        <FormItem className="mt-4">
                        <FormLabel>Transaction ID</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter your TrxID here" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            </div>
        )}

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
