"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Image from "next/image"

type CartDrawerProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: () => void;
};

export default function CartDrawer({ isOpen, onOpenChange, onCheckout }: CartDrawerProps) {
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    getTotalItems, 
    getTotalPrice, 
    clearCart 
  } = useCart()

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  if (totalItems === 0) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Your Cart
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mb-4">Add some products to get started!</p>
            <Button onClick={() => onOpenChange(false)}>
              Continue Shopping
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart ({totalItems} items)
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-grow">
          <div className="px-6">
            {items.map((item, index) => (
              <div key={`${item.product.id}-${item.size}`}>
                <div className="flex gap-4 py-4">
                  {/* Product Image */}
                  <div className="aspect-square w-20 relative rounded-md overflow-hidden">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow">
                    <h3 className="font-medium text-sm line-clamp-2">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                    <p className="text-sm text-muted-foreground">Color: {item.product.color}</p>
                    
                    {/* Price */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-primary">৳{item.selected_price.toLocaleString()}</span>
                      {item.selected_price < item.product.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          ৳{item.product.price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 ml-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeFromCart(item.product.id, item.size)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      ৳{(item.selected_price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {index < items.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Cart Footer */}
        <div className="border-t p-6 pt-4 space-y-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span className="text-primary">৳{totalPrice.toLocaleString()}</span>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={clearCart}
              className="flex-1"
            >
              Clear Cart
            </Button>
            <Button 
              onClick={onCheckout}
              className="flex-1"
            >
              Checkout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
