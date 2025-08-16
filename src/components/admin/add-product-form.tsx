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
import { FileUp, Image as ImageIcon, Upload, X } from "lucide-react"
import * as React from "react"
import Image from "next/image"

const productSchema = z.object({
  name: z.string().min(2, "Product name is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().min(1, "Price must be a positive number."),
  category: z.enum(['Drop Shoulder Tees', 'Jerseys', 'Hoodies', 'Basic Collection'], {
    required_error: "Please select a category.",
  }),
  color: z.enum(['Black', 'White', 'Navy', 'Grey', 'Other'], {
    required_error: "Please select a color.",
  }),
  stock: z.coerce.number().int().min(0, "Stock can't be negative."),
  images: z.any().refine(files => files?.length > 0, 'At least one image is required.'),
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
      images: undefined,
    },
  })

  const selectedFiles = form.watch("images")

  async function onSubmit(values: z.infer<typeof productSchema>) {
    try {
      const files = values.images as FileList;
      const imageUrls: string[] = [];

      for (const file of Array.from(files)) {
        const filePath = `public/${Date.now()}-${file.name}`;
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
        imageUrls.push(publicUrlData.publicUrl);
      }

      const productData = {
        ...values,
        images: imageUrls,
      };

      const { error: insertError } = await supabase.from('products').insert([productData]).select();

      if (insertError) {
        throw new Error(`Failed to add product: ${insertError.message}`);
      }

      toast({
        title: "🎉 Product Added!",
        description: `"${values.name}" has been added to your store.`,
      })
      form.reset()
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
    <Card>
      <CardHeader>
        <CardTitle>Add a New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
                control={form.control}
                name="images"
                render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                    <FormLabel>Product Images</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="sr-only"
                                id="file-upload"
                                onChange={(e) => onChange(e.target.files)}
                                {...rest}
                            />
                            <label 
                                htmlFor="file-upload" 
                                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FileUp className="w-8 h-8 mb-4 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            </label>
                        </div>
                    </FormControl>
                    {selectedFiles && selectedFiles.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                            {Array.from(selectedFiles).map((file: File, index) => (
                                <div key={index} className="relative group">
                                    <Image
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        width={100}
                                        height={100}
                                        className="object-cover w-full h-24 rounded-md"
                                        onLoad={e => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newFiles = Array.from(selectedFiles).filter((_, i) => i !== index);
                                            const dataTransfer = new DataTransfer();
                                            newFiles.forEach(file => dataTransfer.items.add(file));
                                            onChange(dataTransfer.files.length > 0 ? dataTransfer.files : null);
                                        }}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <FormMessage />
                    </FormItem>
                )}
                />
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
                {form.formState.isSubmitting ? 'Uploading...' : 'Add Product'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
