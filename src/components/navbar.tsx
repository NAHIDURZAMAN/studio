"use client"

import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { UserCircle, Menu, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Separator } from './ui/separator';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const adminEmails = ["nahidurzaman1903@gmail.com", "sakifshahrear@gmail.com"];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = (currentUser: User | null) => {
        setUser(currentUser);
        if (currentUser && adminEmails.includes(currentUser.email ?? '')) {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    };
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      checkUser(session?.user ?? null);
    });

    // Check initial session
    const getInitialUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        checkUser(user);
    }
    getInitialUser();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-secondary border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="https://scontent.fdac179-1.fna.fbcdn.net/v/t39.30808-6/491689361_2080392212456783_6779875994807281819_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=9oLU2biu0qkQ7kNvwHyfvPK&_nc_oc=AdkK1UzORJfJoyycZQAvfMB5LwnCk1EtHYQQClsygPJZx-TaXwYR4OS_C7HohiqLL5s&_nc_zt=23&_nc_ht=scontent.fdac179-1.fna&_nc_gid=w-lm2cE3njoKf4FJyabnsg&oh=00_AfWFnx645RUOILC_Cj3JHpsM9gafjvENMmfgARna3aGYVg&oe=68A7273E"
            alt="X Style Logo"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
            data-ai-hint="logo"
          />
          <span className="font-headline text-2xl font-bold text-primary">
            X Style
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/?new_arrivals=true">New Arrivals</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="#">Collections</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="#">Contact</Link>
          </Button>
          {/*
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user ? (
                <>
                  {isAdmin ? (
                     <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Panel</Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/my-orders">My Orders</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/login">Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/signup">Sign Up</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          */}
        </nav>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="font-headline text-2xl">Menu</SheetTitle>
              </SheetHeader>
                <div className="flex flex-col gap-4 p-4">
                    <Link href="/?new_arrivals=true" className="text-lg font-medium">New Arrivals</Link>
                    <Link href="#" className="text-lg font-medium">Collections</Link>
                    <Link href="#" className="text-lg font-medium">Contact</Link>
                    {/*
                    <Separator />
                     {user ? (
                      <>
                        {isAdmin ? (
                          <Link href="/admin" className="text-lg font-medium">Admin Panel</Link>
                        ) : (
                           <Link href="/my-orders" className="text-lg font-medium">My Orders</Link>
                        )}
                        <Button variant="ghost" onClick={handleLogout} className="justify-start p-0 h-auto text-lg font-medium">
                           <LogOut className="mr-2 h-5 w-5" />
                           Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/admin/login" className="text-lg font-medium">Login</Link>
                        <Link href="/signup" className="text-lg font-medium">Sign Up</Link>
                      </>
                    )}
                    */}
                </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
