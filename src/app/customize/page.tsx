"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
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
import { useState, useMemo } from "react"
import { Separator } from "@/components/ui/separator"
import { Banknote, CreditCard, Minus, Plus, Smartphone, Truck, FileUp, X } from "lucide-react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Checkbox } from "@/components/ui/checkbox"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import ProductCard from "@/components/product-card"

const customOrderSchema = z.object({
  name: z.string().min(2, "Name is required."),
  phone: z.string().regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, "Invalid Bangladeshi phone number."),
  secondary_phone: z.string().optional(),
  email: z.string().email("A valid email address is required."),
  address: z.string().min(10, "Full address is required."),
  size: z.string({ required_error: "Please select a size."}),
  paymentMethod: z.enum(['cod', 'prepaid'], { required_error: "Please select a payment method." }),
  deliveryLocation: z.enum(['dhaka', 'outside'], { required_error: "Please select delivery location." }),
  transactionId: z.string().optional(),
  paymentConfirmation: z.boolean(),
  frontDesign: z.any().refine(file => file?.length === 1, 'A front design is required.'),
  backDesign: z.any().optional(),
}).refine(data => {
  if (data.paymentMethod === 'prepaid' && (!data.transactionId || data.transactionId.trim().length < 5)) {
    return false;
  }
  return true;
}, {
  message: "A valid Transaction ID is required for this payment method.",
  path: ["transactionId"],
}).refine(data => {
    if (!data.paymentConfirmation) {
        return false;
    }
    return true;
}, {
    message: "Please confirm you agree to the payment terms.",
    path: ["paymentConfirmation"],
});


const sizes = ["S", "M", "L", "XL", "XXL", "XXXL"];
const BASE_PRICE = 250;


export default function CustomizePage() {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [promotedProducts, setPromotedProducts] = useState<Product[]>([]);
  const [loadingPromoted, setLoadingPromoted] = useState(true);

  const form = useForm<z.infer<typeof customOrderSchema>>({
    resolver: zodResolver(customOrderSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      paymentMethod: 'cod',
      transactionId: "",
      secondary_phone: "",
      paymentConfirmation: false,
    },
  });

  const frontDesignFile = form.watch("frontDesign");
  const backDesignFile = form.watch("backDesign");

  const price = useMemo(() => {
    const hasFront = frontDesignFile && frontDesignFile.length > 0;
    const hasBack = backDesignFile && backDesignFile.length > 0;

    if (hasFront && hasBack) return 400;
    if (hasFront) return 350;
    return BASE_PRICE; 

  }, [frontDesignFile, backDesignFile]);

  const deliveryLocation = form.watch("deliveryLocation");
  const paymentMethod = form.watch("paymentMethod");
  const deliveryCharge = deliveryLocation === 'dhaka' ? 70 : deliveryLocation === 'outside' ? 120 : 0;
  const subtotal = price * quantity;
  const total = subtotal + deliveryCharge;
  
  const uploadFile = async (file: File) => {
    const filePath = `custom-designs/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);
    
    if (!publicUrlData.publicUrl) {
        throw new Error("Could not get public URL for the uploaded file.")
    }
    return publicUrlData.publicUrl;
  };


  async function onSubmit(values: z.infer<typeof customOrderSchema>) {
    try {
      const frontDesignUrl = await uploadFile(values.frontDesign[0]);
      let backDesignUrl = null;
      if (values.backDesign && values.backDesign.length > 0) {
        backDesignUrl = await uploadFile(values.backDesign[0]);
      }

      const orderData = {
        customer_name: values.name,
        customer_phone: values.phone,
        secondary_phone: values.secondary_phone,
        customer_email: values.email,
        customer_address: values.address,
        size: values.size,
        quantity,
        total_price: total,
        delivery_charge: deliveryCharge,
        payment_method: values.paymentMethod,
        delivery_location: values.deliveryLocation,
        transaction_id: values.transactionId,
        front_design_url: frontDesignUrl,
        back_design_url: backDesignUrl,
        status: 'pending_review',
      };

      const { error } = await supabase.from('custom_orders').insert([orderData]);

      if (error) {
        throw new Error(`Failed to submit custom order: ${error.message}`);
      }

      toast({
        title: "🎉 Custom Order Submitted!",
        description: "We've received your design. We'll contact you shortly to confirm.",
      })
      form.reset();
    } catch (error: any) {
      console.error("Error submitting form:", error)
      toast({
          title: "❌ Error",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
           <div className="text-center mb-12">
             <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-foreground">
               Customize Your Own Design
             </h1>
             <p className="mt-4 text-lg font-alegreya text-muted-foreground max-w-2xl mx-auto">
               Have a design in mind? Upload it here and we'll print it for you on our premium drop shoulder t-shirts.
             </p>
           </div>
          
           <Card>
            <CardContent className="p-6">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <FormField
                        control={form.control}
                        name="frontDesign"
                        render={({ field: { onChange, ...rest } }) => (
                            <FormItem>
                            <FormLabel>Front Design</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="sr-only"
                                        id="front-design-upload"
                                        onChange={(e) => onChange(e.target.files)}
                                        {...rest}
                                    />
                                    <label 
                                        htmlFor="front-design-upload" 
                                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted"
                                    >
                                        {frontDesignFile && frontDesignFile.length > 0 ? (
                                            <Image src={URL.createObjectURL(frontDesignFile[0])} alt="Front design preview" layout="fill" className="object-contain rounded-lg p-2" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <FileUp className="w-8 h-8 mb-4 text-muted-foreground" />
                                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                                                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="backDesign"
                        render={({ field: { onChange, ...rest } }) => (
                            <FormItem>
                            <FormLabel>Back Design (Optional)</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="sr-only"
                                        id="back-design-upload"
                                        onChange={(e) => onChange(e.target.files)}
                                        {...rest}
                                    />
                                    <label 
                                        htmlFor="back-design-upload" 
                                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted"
                                    >
                                        {backDesignFile && backDesignFile.length > 0 ? (
                                            <Image src={URL.createObjectURL(backDesignFile[0])} alt="Back design preview" layout="fill" className="object-contain rounded-lg p-2" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <FileUp className="w-8 h-8 mb-4 text-muted-foreground" />
                                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                                                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                     <div className="bg-muted/50 p-4 rounded-lg space-y-2 mt-6">
                        <div className="flex justify-between font-bold text-lg">
                            <span>Price</span>
                            <span>৳ {price.toLocaleString()}</span>
                        </div>
                        <FormDescription>
                           Base price for a solid color drop shoulder is ৳250. One-sided design is ৳350. Two-sided is ৳400.
                        </FormDescription>
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
                                    {sizes.map(size => (
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Full Name</FormLabel> <FormControl> <Input placeholder="Your full name" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                        <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Phone Number (WhatsApp)</FormLabel> <FormControl> <Input placeholder="01xxxxxxxxx" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                        <FormField control={form.control} name="secondary_phone" render={({ field }) => ( <FormItem> <FormLabel>Secondary Phone Number (Optional)</FormLabel> <FormControl> <Input placeholder="Another contact number" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                        <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email</FormLabel> <FormControl> <Input placeholder="you@example.com" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                    </div>

                    <FormField control={form.control} name="address" render={({ field }) => ( <FormItem> <FormLabel>Full Address</FormLabel> <FormControl> <Textarea placeholder="Include house, road, area, and city" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>

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
                                <SelectItem value="dhaka">Inside Dhaka (৳70)</SelectItem>
                                <SelectItem value="outside">Outside Dhaka (৳120)</SelectItem>
                            </SelectContent>
                            </Select>
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
                              <div className="flex items-center space-x-3 space-y-0">
                                <RadioGroupItem value="cod" id="cod" />
                                <FormLabel htmlFor="cod" className="font-normal">
                                  Cash on Delivery
                                </FormLabel>
                              </div>
                              <div className="flex items-center space-x-3 space-y-0">
                                <RadioGroupItem value="prepaid" id="prepaid" />
                                <FormLabel htmlFor="prepaid" className="font-normal">
                                  Pre-paid (bKash/Nagad/etc.)
                                </FormLabel>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {paymentMethod === 'prepaid' && (
                         <FormField
                            control={form.control}
                            name="transactionId"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Transaction ID</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your TrxID here" {...field} />
                                </FormControl>
                                 <FormDescription>Please send ৳{total.toLocaleString()} to our bKash/Nagad and enter the transaction ID.</FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name="paymentConfirmation"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                I agree to the terms and conditions.
                                </FormLabel>
                                <FormMessage />
                            </div>
                            </FormItem>
                        )}
                    />

                    <div className="bg-primary/10 p-4 rounded-lg space-y-2 mt-6">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>৳ {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Delivery Charge</span>
                            <span>৳ {deliveryCharge.toLocaleString()}</span>
                        </div>
                        <Separator/>
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>৳ {total.toLocaleString()}</span>
                        </div>
                    </div>

                    <Button type="submit" className="w-full text-lg py-6" disabled={form.formState.isSubmitting}>
                        <Banknote className="mr-2 h-5 w-5"/>
                        Submit Custom Order
                    </Button>
                </form>
                </Form>
            </CardContent>
           </Card>

           <div className="text-center my-16">
             <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-foreground">
               Previous Creations
             </h2>
             <p className="mt-4 text-lg font-alegreya text-muted-foreground max-w-2xl mx-auto">
               Check out some of the awesome designs made by our customers that are now available in our store!
             </p>
           </div>
           
           {/* Gallery Section will go here */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
               {/* Example Card */}
                {/* 
                <ProductCard product={...} onBuyNow={...} />
                */}
            </div>

        </div>
        <Separator className="my-12 container" />
        <Footer />
      </main>
    </div>
  )
}
