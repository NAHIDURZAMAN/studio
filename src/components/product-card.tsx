"use client"

import Image from "next/image"
import type { Product } from "@/types"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "./ui/badge"
import { ShoppingCart } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel"

type ProductCardProps = {
  product: Product;
  onBuyNow: (product: Product) => void;
};

export default function ProductCard({ product, onBuyNow }: ProductCardProps) {
  const isLimitedStock = product.stock > 0 && product.stock < 10;
  const isOutOfStock = product.stock === 0;

  return (
    <Card className="flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <Carousel className="w-full">
          <CarouselContent>
            {product.images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="aspect-[4/5] w-full relative">
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
        </Carousel>
        {(isLimitedStock || isOutOfStock) && (
             <Badge variant={isOutOfStock ? "destructive" : "secondary"} className="absolute top-3 right-3 z-10">
                {isOutOfStock ? "Out of Stock" : `Only ${product.stock} left!`}
             </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-headline text-lg mb-1">{product.name}</CardTitle>
        <p className="font-alegreya text-sm text-muted-foreground">{product.category}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="text-base md:text-lg font-bold text-primary">৳{product.price.toLocaleString()}</p>
        <Button onClick={() => onBuyNow(product)} disabled={isOutOfStock} className="h-6 px-1.5 md:h-9 md:px-3">
            <ShoppingCart className="mr-1 h-3 w-3" />
            <span className="text-xs md:text-sm">Buy Now</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
