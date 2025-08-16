import { Button } from "./ui/button";
import { ArrowRight, MapPin, Truck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const marqueeItems = [
  "Drop Shoulder Tees",
  "Jerseys",
  "Hoodies",
  "Nationwide Delivery",
  "Basic Collection",
  "Mirpur 12 Store",
  "Free Customization",
];

export default function Hero() {
  return (
    <section className="bg-primary text-primary-foreground overflow-hidden">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">
          Your Style, Your Way.
        </h1>
        <p className="mt-4 text-lg font-alegreya opacity-90 max-w-2xl mx-auto">
          From the streets of Mirpur to every corner of Bangladesh, X Style delivers the freshest urban fashion.
        </p>
         <div className="mt-8 text-sm">
            <p>Same-day Dhaka delivery | 2-4 days nationwide</p>
        </div>
      </div>
      <div className="relative mt-8 flex w-full gap-x-6 py-4 bg-background/10 whitespace-nowrap">
        <div className="flex animate-marquee">
          {marqueeItems.map((item, index) => (
            <div key={index} className="mx-6 flex items-center gap-3 text-lg font-headline">
              <span className="opacity-75">*</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
         <div className="flex animate-marquee" aria-hidden="true">
          {marqueeItems.map((item, index) => (
            <div key={index} className="mx-6 flex items-center gap-3 text-lg font-headline">
              <span className="opacity-75">*</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
