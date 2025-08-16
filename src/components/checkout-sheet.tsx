"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Product } from "@/types"
import CheckoutForm from "./checkout-form"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel"

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
            You're just a few steps away. order করে ফেলো!
          </SheetDescription>
        </SheetHeader>
        <div className="relative w-full">
          <Carousel className="w-full">
            <CarouselContent>
              {product.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative h-48 w-full">
                    <Image
                      src={image}
                      alt={`${product.name} image ${index + 1}`}
                      fill
                      className="object-cover"
                      data-ai-hint={product.dataAiHint}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
             {product.images.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
              </>
            )}
          </Carousel>
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
