
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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Separator } from "@/components/ui/separator"
import { Banknote, FileUp, PlusCircle, Trash2 } from "lucide-react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"

const designSchema = z.object({
  file: z.any().refine(file => file?.length === 1, 'A design file is required.'),
  instructions: z.string().optional(),
});

const customOrderSchema = z.object({
  name: z.string().min(2, "Name is required."),
  phone: z.string().regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, "Invalid Bangladeshi phone number."),
  address: z.string().min(10, "Full address is required."),
  designs: z.array(designSchema).min(1, "At least one design is required."),
});


export default function CustomizePage() {
  const { toast } = useToast()
  const [designs, setDesigns] = useState<{ file: FileList | null; instructions: string }[]>([
    { file: null, instructions: "" }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof customOrderSchema>>({
    resolver: zodResolver(customOrderSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      designs: [{ file: undefined, instructions: "" }],
    },
  });

  const handleDesignChange = (index: number, file: FileList | null) => {
    const newDesigns = [...designs];
    newDesigns[index].file = file;
    setDesigns(newDesigns);
    form.setValue(`designs.${index}.file`, file, { shouldValidate: true });
  };

  const handleInstructionChange = (index: number, instructions: string) => {
    const newDesigns = [...designs];
    newDesigns[index].instructions = instructions;
    setDesigns(newDesigns);
     form.setValue(`designs.${index}.instructions`, instructions, { shouldValidate: true });
  };

  const addDesign = () => {
    setDesigns([...designs, { file: null, instructions: "" }]);
    form.setValue('designs', [...form.getValues('designs'), { file: undefined, instructions: '' }]);
  };
  
  const removeDesign = (index: number) => {
    const newDesigns = designs.filter((_, i) => i !== index);
    setDesigns(newDesigns);
    const newFormDesigns = form.getValues('designs').filter((_, i) => i !== index);
    form.setValue('designs', newFormDesigns, { shouldValidate: true });
  };
  
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
    setIsSubmitting(true);
    try {
      const uploadedDesigns = await Promise.all(
        values.designs.map(async (design) => {
          const designUrl = await uploadFile(design.file[0]);
          return {
            design_url: designUrl,
            instructions: design.instructions || "",
          };
        })
      );

      const orderData = {
        customer_name: values.name,
        customer_phone: values.phone,
        customer_address: values.address,
        designs: uploadedDesigns,
        status: 'pending_review',
      };

      const { error } = await supabase.from('custom_orders').insert([orderData]);

      if (error) {
        throw new Error(`Failed to submit custom order: ${error.message}`);
      }

      toast({
        title: "🎉 Custom Order Submitted!",
        description: "We've received your designs. We will call you soon to confirm the printing cost and order.",
      })
      form.reset();
      setDesigns([{ file: null, instructions: "" }]);
    } catch (error: any) {
      console.error("Error submitting form:", error)
      toast({
          title: "❌ Error",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
      })
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
           <div className="text-center mb-12">
             <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-foreground">
               Customize Your Vision
             </h1>
             <p className="mt-4 text-lg font-alegreya text-muted-foreground max-w-2xl mx-auto">
              Upload one or more designs, add instructions, and place your order. We'll call you to confirm the final price.
             </p>
           </div>
          
           <Card>
            <CardContent className="p-6">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-6">
                        {designs.map((design, index) => (
                           <div key={index} className="rounded-lg border p-4 space-y-4 relative">
                                <FormLabel className="font-bold text-lg">Design {index + 1}</FormLabel>
                                {designs.length > 1 && (
                                    <Button 
                                        type="button"
                                        variant="ghost" 
                                        size="icon" 
                                        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                                        onClick={() => removeDesign(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                    <FormField
                                        control={form.control}
                                        name={`designs.${index}.file`}
                                        render={({ field: { onChange, value, ...rest } }) => (
                                            <FormItem>
                                                <FormLabel>Upload Design {index + 1}</FormLabel>
                                                <div className="relative">
                                                     <label 
                                                         htmlFor={`design-upload-${index}`} 
                                                         className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted"
                                                     >
                                                         {design.file && design.file.length > 0 ? (
                                                             <Image src={URL.createObjectURL(design.file[0])} alt={`Design ${index + 1} preview`} fill className="object-contain rounded-lg p-2" />
                                                         ) : (
                                                             <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                 <FileUp className="w-8 h-8 mb-4 text-muted-foreground" />
                                                                 <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                                                                 <p className="text-xs text-muted-foreground">PNG, JPG, GIF</p>
                                                             </div>
                                                         )}
                                                     </label>
                                                     <FormControl>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="sr-only"
                                                            id={`design-upload-${index}`}
                                                            onChange={(e) => {
                                                                onChange(e.target.files);
                                                                handleDesignChange(index, e.target.files);
                                                            }}
                                                            {...rest}
                                                        />
                                                    </FormControl>
                                                 </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                        />
                                     <FormField
                                        control={form.control}
                                        name={`designs.${index}.instructions`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Print Instructions {index + 1}</FormLabel>
                                                <FormControl>
                                                    <Textarea 
                                                        placeholder={`e.g., "Place this on the center chest, 4 inches wide."`} 
                                                        rows={6}
                                                        {...field}
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            handleInstructionChange(index, e.target.value);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                        />
                                </div>
                           </div>
                        ))}
                    </div>

                    <Button type="button" variant="outline" onClick={addDesign}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Another Design
                    </Button>
                    
                    <Separator/>

                    <div>
                        <h2 className="text-2xl font-headline font-bold mb-4">Your Information</h2>
                        <div className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Full Name</FormLabel> <FormControl> <Input placeholder="Your full name" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Phone Number (WhatsApp)</FormLabel> <FormControl> <Input placeholder="01xxxxxxxxx" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="address" render={({ field }) => ( <FormItem> <FormLabel>Full Delivery Address</FormLabel> <FormControl> <Textarea placeholder="Include house, road, area, and city" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                        </div>
                    </div>


                    <div className="bg-primary/10 p-4 rounded-lg space-y-2 mt-6 text-center">
                       <p className="font-semibold text-primary-foreground">After you submit, we will call you to confirm the final printing cost and complete the order.</p>
                    </div>

                    <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting}>
                        <Banknote className="mr-2 h-5 w-5"/>
                        {isSubmitting ? 'Submitting...' : 'Submit Designs for Quotation'}
                    </Button>
                </form>
                </Form>
            </CardContent>
           </Card>

        </div>
        <Separator className="my-12 container" />
        <Footer />
      </main>
    </div>
  )

}
    
