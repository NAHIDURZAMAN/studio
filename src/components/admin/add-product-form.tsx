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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Upload } from "lucide-react"

const productSchema = z.object({
  name: z.string().min(2, "Product name is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().min(1, "Price must be a positive number."),
  category: z.enum(['Drop Shoulder Tees', 'Jerseys', 'Hoodies', 'Basic Collection']),
  color: z.enum(['Black', 'White', 'Navy', 'Grey', 'Other']),
  stock: z.coerce.number().int().min(0, "Stock can't be negative."),
  images: z.string().min(1, "At least one image URL is required."),
  data_ai_hint: z.string().optional(),
})

export default function AddProductForm() {
  const { toast } = useToast()
  
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      images: "",
    },
  })

  async function onSubmit(values: z.infer<typeof productSchema>) {
    const productData = {
      ...values,
      images: values.images.split(',').map(url => url.trim()),
    };

    const { data, error } = await supabase.from('products').insert([productData]).select();

    if (error) {
      console.error("Error inserting product:", error)
      toast({
        title: "❌ Error",
        description: "Failed to add the product. Please try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "🎉 Product Added!",
        description: `"${values.name}" has been added to your store.`,
      })
      form.reset()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Urban Explorer Tee" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the product" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Price (৳)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g., 950" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g., 25" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Drop Shoulder Tees">Drop Shoulder Tees</SelectItem>
                            <SelectItem value="Jerseys">Jerseys</SelectItem>
                            <SelectItem value="Hoodies">Hoodies</SelectItem>
                            <SelectItem value="Basic Collection">Basic Collection</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Color</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a color" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Black">Black</SelectItem>
                            <SelectItem value="White">White</SelectItem>
                            <SelectItem value="Navy">Navy</SelectItem>
                            <SelectItem value="Grey">Grey</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
             </div>
             <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Product Images</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Enter image URLs, separated by commas" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="data_ai_hint"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>AI Hint (Optional)</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., black t-shirt" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <Button type="submit" disabled={form.formState.isSubmitting}>
                <Upload className="mr-2 h-4 w-4" />
                Add Product
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
