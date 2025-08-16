"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Product } from "@/types"
import CheckoutForm from "./checkout-form"
import Image from "next/image"

type CheckoutSheetProps = {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CheckoutSheet({ product, isOpen, onOpenChange }: CheckoutSheetProps) {
  if (!product) return null;

  const handleSuccess = () => {
    onOpenChange(false);
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="font-headline text-2xl">Confirm Your Order</SheetTitle>
          <SheetDescription>
            You're just a few steps away. चलो, order করে ফেলো!
          </SheetDescription>
        </SheetHeader>
        <div className="relative h-48 w-full">
            <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                data-ai-hint={product.dataAiHint}
            />
        </div>
        <ScrollArea className="flex-grow">
            <div className="p-6">
                <CheckoutForm product={product} onSuccess={handleSuccess} />
            </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
