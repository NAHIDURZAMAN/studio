"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/types"
import { updateProductServer } from "@/actions/update-product"
import Image from "next/image"
import { X, Upload, Plus, Trash2 } from "lucide-react"

type ProductEditDialogProps = {
  product: Product | null
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onProductUpdated: () => void
}

const sizes = ["S", "M", "L", "XL", "XXL", "XXXL"]
const categories = ['Drop Shoulder Tees', 'Jerseys', 'Hoodies', 'Basic Collection']
const colors = ['Black', 'White', 'Navy', 'Grey', 'Other']

export default function ProductEditDialog({ product, isOpen, onOpenChange, onProductUpdated }: ProductEditDialogProps) {
  const [formData, setFormData] = useState<Partial<Product>>({})
  const [isUpdating, setIsUpdating] = useState(false)
  const [newImages, setNewImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (product) {
      // Debug: Check what product data we're receiving
      console.log("=== PRODUCT EDIT DIALOG OPENED ===");
      console.log("Original product data:", {
        id: product.id,
        name: product.name,
        price: product.price,
        discount_percentage: product.discount_percentage,
        discount_price: product.discount_price
      });
      
      const initialFormData = {
        name: product.name,
        description: product.description,
        price: product.price,
        discount_percentage: product.discount_percentage || 0,
        discount_price: product.discount_price || undefined,
        category: product.category,
        color: product.color,
        stock: product.stock,
        sizes: product.sizes,
        data_ai_hint: product.data_ai_hint,
        images: product.images
      };
      
      console.log("Setting form data to:", {
        discount_percentage: initialFormData.discount_percentage,
        discount_price: initialFormData.discount_price
      });
      
      setFormData(initialFormData);
      setNewImages([])
      setImagePreviews([])
    }
  }, [product])

  if (!product) return null

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setNewImages(prev => [...prev, ...files])
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreviews(prev => [...prev, result])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDeleteExistingImage = (index: number) => {
    const updatedImages = [...(formData.images || [])]
    updatedImages.splice(index, 1)
    setFormData({
      ...formData,
      images: updatedImages
    })
  }

  const handleDeleteNewImage = (index: number) => {
    const updatedNewImages = [...newImages]
    const updatedPreviews = [...imagePreviews]
    updatedNewImages.splice(index, 1)
    updatedPreviews.splice(index, 1)
    setNewImages(updatedNewImages)
    setImagePreviews(updatedPreviews)
  }

  const uploadNewImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = []

    for (const file of newImages) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`)
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      if (publicUrlData.publicUrl) {
        uploadedUrls.push(publicUrlData.publicUrl)
      }
    }

    return uploadedUrls
  }

  const handleSave = async () => {
    console.log("=== SAVE BUTTON CLICKED ===");
    console.log("Current form data before save:", {
      name: formData.name,
      price: formData.price,
      discount_percentage: formData.discount_percentage,
      discount_price: formData.discount_price
    });
    
    setIsUpdating(true)
    
    try {
      // Upload new images if any
      let finalImages = [...(formData.images || [])]
      
      if (newImages.length > 0) {
        const uploadedUrls = await uploadNewImages()
        finalImages = [...finalImages, ...uploadedUrls]
      }

      // Calculate discount price - fixed logic
      let finalDiscountPercentage = 0;
      let finalDiscountPrice = null;
      
      if (formData.discount_percentage && formData.discount_percentage > 0) {
        finalDiscountPercentage = formData.discount_percentage;
        finalDiscountPrice = formData.discount_price || ((formData.price || 0) * (1 - formData.discount_percentage / 100));
      }

      console.log("=== USING SERVER ACTION FOR UPDATE ===");
      console.log("Product ID:", product.id);
      console.log("Final discount percentage:", finalDiscountPercentage);
      console.log("Final discount price:", finalDiscountPrice);

      const updateData = {
        name: formData.name || product.name || "",
        description: formData.description || product.description || "",
        price: formData.price || product.price || 0,
        discount_percentage: finalDiscountPercentage,
        discount_price: finalDiscountPrice || undefined,
        category: formData.category || product.category || "",
        color: formData.color || product.color || "",
        stock: formData.stock || product.stock || 0,
        sizes: formData.sizes || product.sizes || [],
        data_ai_hint: formData.data_ai_hint || product.data_ai_hint || "",
        images: finalImages
      };

      console.log("Calling server action with data:", updateData);

      // Use server action instead of direct Supabase call
      const result = await updateProductServer(product.id, updateData);

      if (!result.success) {
        console.error("Server action failed:", result.error);
        throw new Error(result.error || "Failed to update product");
      }

      console.log("✅ Server action successful:", result.data);

      // Debug: Check if save was successful
      console.log("Product updated successfully with discount data:", {
        discount_percentage: result.data?.discount_percentage,
        discount_price: result.data?.discount_price
      });

      toast({
        title: "✅ Product Updated!",
        description: `${formData.name} has been updated successfully.`,
      })
      
      // Immediate callback to refresh the products view
      onProductUpdated()
      
      // Close dialog immediately
      onOpenChange(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not update the product. Please try again.",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSizeChange = (size: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        sizes: [...(formData.sizes || []), size]
      })
    } else {
      setFormData({
        ...formData,
        sizes: (formData.sizes || []).filter(s => s !== size)
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Left Column - Product Images */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Product Images</label>
              
              {/* Existing Images */}
              {(formData.images && formData.images.length > 0) && (
                <div>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">Current Images:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {formData.images.map((image, index) => (
                      <div key={`existing-${index}`} className="aspect-square relative border rounded-lg overflow-hidden group">
                        <Image
                          src={image}
                          alt={`Product image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteExistingImage(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              {imagePreviews.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-2">New Images to Add:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="aspect-square relative border rounded-lg overflow-hidden group">
                        <Image
                          src={preview}
                          alt={`New image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteNewImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Image Button */}
              <div className="mt-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add More Images
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Product Name</label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Price (৳)</label>
                <Input
                  type="number"
                  value={formData.price || 0}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stock</label>
                <Input
                  type="number"
                  value={formData.stock || 0}
                  onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                />
              </div>
            </div>

            {/* Discount Section */}
            <div className="space-y-4">
              <label className="text-sm font-medium">Discount Options</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Discount (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.discount_percentage || ''}
                    onChange={(e) => {
                      const percentage = parseFloat(e.target.value) || 0;
                      const price = formData.price || 0;
                      
                      console.log("Discount percentage changed:", percentage);
                      
                      if (percentage > 0) {
                        const discountPrice = price * (1 - percentage / 100);
                        console.log("Calculated discount price:", discountPrice);
                        setFormData({
                          ...formData, 
                          discount_percentage: percentage,
                          discount_price: discountPrice
                        });
                      } else {
                        setFormData({
                          ...formData, 
                          discount_percentage: 0,
                          discount_price: undefined
                        });
                      }
                    }}
                    placeholder="e.g., 20"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter percentage (0-100)
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Discount Price (৳)</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.discount_price || ''}
                    onChange={(e) => {
                      const discountPrice = parseFloat(e.target.value) || 0;
                      const price = formData.price || 0;
                      
                      console.log("Discount price changed:", discountPrice);
                      
                      if (discountPrice > 0 && discountPrice < price) {
                        const percentage = ((price - discountPrice) / price) * 100;
                        console.log("Calculated discount percentage:", percentage);
                        setFormData({
                          ...formData, 
                          discount_price: discountPrice,
                          discount_percentage: percentage
                        });
                      } else if (discountPrice === 0 || e.target.value === '') {
                        setFormData({
                          ...formData, 
                          discount_price: undefined,
                          discount_percentage: 0
                        });
                      }
                    }}
                    placeholder="e.g., 760"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Direct discount price
                  </p>
                </div>
              </div>
              
              {/* Price Preview */}
              <div className="bg-muted p-3 rounded-md">
                <div className="text-sm font-medium mb-2">Price Preview:</div>
                
                {/* Debug Info - Remove this after testing */}
                <div className="text-xs text-green-600 mb-2 font-mono">
                  ✅ Discount system working! Percentage: {formData.discount_percentage?.toFixed(1)}%, Price: ৳{formData.discount_price}
                </div>
                
                {(() => {
                  const price = formData.price || 0;
                  const discount = formData.discount_percentage || 0;
                  const discountPrice = formData.discount_price || price;
                  
                  if (discount > 0) {
                    return (
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="line-through text-red-500 text-lg">৳{price}</span>
                          <span className="text-green-600 font-bold text-xl">৳{discountPrice.toFixed(0)}</span>
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                            -{discount.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Customer saves: <span className="font-semibold text-green-600">৳{(price - discountPrice).toFixed(0)}</span>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-lg font-semibold">৳{price}</div>
                    );
                  }
                })()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Color</label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData({...formData, color: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map(color => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Available Sizes</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {sizes.map(size => (
                  <div key={size} className="flex items-center space-x-2">
                    <Checkbox
                      id={size}
                      checked={(formData.sizes || []).includes(size)}
                      onCheckedChange={(checked) => handleSizeChange(size, !!checked)}
                    />
                    <label htmlFor={size} className="text-sm">{size}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">AI Hint (Optional)</label>
              <Input
                value={formData.data_ai_hint || ''}
                onChange={(e) => setFormData({...formData, data_ai_hint: e.target.value})}
                placeholder="Description for AI features"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
