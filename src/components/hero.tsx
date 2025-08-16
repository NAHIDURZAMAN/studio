import { Button } from "./ui/button";
import { ArrowRight, MapPin, Truck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="bg-secondary">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tight">
              Your Style, Your Way.
            </h1>
            <p className="text-lg text-secondary-foreground font-alegreya">
              From the streets of Mirpur to every corner of Bangladesh, X STYLE delivers the freshest urban fashion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
               <div className="bg-card p-4 rounded-lg border flex-1">
                    <h2 className="font-bold font-headline text-lg flex items-center gap-2"><MapPin className="text-accent"/> Physical Store</h2>
                    <p className="text-sm text-muted-foreground mt-1">📍 Mirpur 12, Dhaka</p>
                    <p className="font-bold mt-2 text-primary">চলো না একবার দোকানে!</p>
               </div>
               <div className="bg-card p-4 rounded-lg border flex-1">
                    <h2 className="font-bold font-headline text-lg flex items-center gap-2"><Truck className="text-accent"/> Online Delivery</h2>
                    <p className="text-sm text-muted-foreground mt-1">🚚 64 Districts, Nationwide</p>
                    <p className="font-bold mt-2 text-primary">Online ই অর্ডার করো!</p>
               </div>
            </div>
            <div className="text-sm text-muted-foreground">
                <p>Same-day Dhaka delivery | 2-4 days nationwide</p>
            </div>
          </div>
          <div className="relative h-80 w-full rounded-lg overflow-hidden shadow-xl">
             <Image src="https://placehold.co/600x400.png" alt="X STYLE Fashion" layout="fill" objectFit="cover" data-ai-hint="fashion store" />
          </div>
        </div>
      </div>
    </section>
  );
}
