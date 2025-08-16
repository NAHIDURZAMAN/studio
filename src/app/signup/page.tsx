"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error.message,
      });
    } else if (data.user) {
      toast({
        title: "Signup Successful!",
        description: "Please check your email to verify your account. You will be redirected to the login page.",
      });
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/admin/login');
      }, 3000);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSignup}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
            <CardDescription>Enter your information to create an account.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input 
                id="full-name" 
                placeholder="Your Name" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/admin/login" prefetch={false} className="underline">
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
