import { ShoppingBag } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
           <ShoppingBag className="h-6 w-6 text-primary" />
           <span className="text-2xl font-bold font-headline">X STYLE E-STORE</span>
        </div>
        {/* Navigation items can be added here */}
      </div>
    </header>
  );
}
