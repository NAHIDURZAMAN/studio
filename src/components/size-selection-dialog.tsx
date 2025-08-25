"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useRef } from "react"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/types"
import Image from "next/image"
import { Minus, Plus, ShoppingCart } from "lucide-react"

type SizeSelectionDialogProps = {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function SizeSelectionDialog({ product, isOpen, onOpenChange }: SizeSelectionDialogProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart, triggerArrow, triggerFlyingCart, getTotalItems } = useCart();
  const { toast } = useToast();
  const addToCartButtonRef = useRef<HTMLButtonElement>(null);
  const buyNowButtonRef = useRef<HTMLButtonElement>(null);

  if (!product) return null;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        variant: "destructive",
        title: "Size Required",
        description: "Please select a size before adding to cart.",
      });
      return;
    }

    // Check if cart is empty (first item)
    const isFirstItem = getTotalItems() === 0;

    // Add to cart first
    addToCart(product, selectedSize, quantity);
    
    // Trigger flying cart animation for first item, regular arrow for others
    if (addToCartButtonRef.current) {
      if (isFirstItem) {
        triggerFlyingCart(addToCartButtonRef.current);
      } else {
        triggerArrow(addToCartButtonRef.current);
      }
    }
    
    toast({
      title: isFirstItem ? "🚀 Welcome to Cart!" : "🎉 Added to Cart!",
      description: isFirstItem 
        ? `${product.name} (Size ${selectedSize}) × ${quantity} - Watch it fly to your cart! 🛒✨`
        : `${product.name} (Size ${selectedSize}) × ${quantity} has been added to your cart. Watch the arrow! 🏹`,
      duration: 3000,
    });

    // Reset and close
    setSelectedSize("");
    setQuantity(1);
    onOpenChange(false);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast({
        variant: "destructive",
        title: "Size Required",
        description: "Please select a size before proceeding to checkout.",
      });
      return;
    }

    // Check if cart is empty (first item)
    const isFirstItem = getTotalItems() === 0;

    // Add to cart first
    addToCart(product, selectedSize, quantity);
    
    // Trigger flying cart animation for first item, regular arrow for others
    if (buyNowButtonRef.current) {
      if (isFirstItem) {
        triggerFlyingCart(buyNowButtonRef.current);
      } else {
        triggerArrow(buyNowButtonRef.current);
      }
    }
    
    // Reset dialog state
    setSelectedSize("");
    setQuantity(1);
    onOpenChange(false);

    toast({
      title: isFirstItem ? "🚀 Flying to Cart & Ready!" : "🚀 Added & Ready to Checkout!", 
      description: isFirstItem 
        ? "Your first item is flying to cart! Ready for checkout! 🛒✨" 
        : "Product added to cart. Watch the arrow guide you from button to cart! 🏹✨",
      duration: 3000,
    });
  };  // Calculate effective price (discount price if available)
  const effectivePrice = product.discount_price && product.discount_price > 0 
    ? product.discount_price 
    : product.price;

  const hasDiscount = product.discount_price && product.discount_price < product.price;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-left">Select Size & Quantity</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Preview */}
          <div className="flex gap-4">
            <div className="aspect-square w-20 relative rounded-md overflow-hidden">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-grow">
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-muted-foreground">Color: {product.color}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-semibold text-primary">৳{effectivePrice.toLocaleString()}</span>
                {hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through">
                    ৳{product.price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-3">
            <h4 className="font-medium">Select Size</h4>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSize(size)}
                  className="h-10 min-w-[3rem]"
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="space-y-3">
            <h4 className="font-medium">Quantity</h4>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-semibold min-w-[2rem] text-center">{quantity}</span>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setQuantity(q => Math.min(10, q + 1))} // Max 10 per add
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Total: ৳{(effectivePrice * quantity).toLocaleString()}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            ref={addToCartButtonRef}
            variant="outline" 
            onClick={handleAddToCart}
            disabled={!selectedSize}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
          <Button 
            ref={buyNowButtonRef}
            onClick={handleBuyNow}
            disabled={!selectedSize}
            className="flex items-center gap-2"
          >
            Buy Now - ৳{(effectivePrice * quantity).toLocaleString()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
