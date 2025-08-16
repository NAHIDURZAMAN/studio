import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { UserCircle, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Separator } from './ui/separator';

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-secondary border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="https://placehold.co/40x40.png"
            alt="X Style Logo"
            width={40}
            height={40}
            className="h-10 w-auto"
            data-ai-hint="logo"
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/login">Login</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/signup">Sign Up</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/admin">My Orders</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
                <div className="flex flex-col gap-4 p-4">
                    <Link href="#" className="text-lg font-medium">New Arrivals</Link>
                    <Link href="#" className="text-lg font-medium">Collections</Link>
                    <Link href="#" className="text-lg font-medium">Contact</Link>
                    <Separator />
                    <Link href="/login" className="text-lg font-medium">Login</Link>
                    <Link href="/signup" className="text-lg font-medium">Sign Up</Link>
                    <Link href="/admin" className="text-lg font-medium">My Orders</Link>
                </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
