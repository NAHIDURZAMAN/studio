import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/logo.png"
            alt="X Style Logo"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
          <span className="font-headline text-2xl font-bold text-primary">
            X Style
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="#">New Arrivals</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="#">Collections</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="#">Contact</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
