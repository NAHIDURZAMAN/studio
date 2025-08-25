import { Mail, MapPin, MessageSquare, Phone } from "lucide-react"
import { Separator } from "./ui/separator"
import Link from "next/link"
import { Button } from "./ui/button"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          <div className="md:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/assets/logo.png"
                alt="X Style Logo"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
              <h3 className="font-headline text-2xl text-primary">X Style</h3>
            </div>
            <p className="text-sm font-alegreya">
              Be Your Outfit. We ship style to every corner of Bangladesh.
            </p>
          </div>

          <div className="md:col-span-5">
            <h3 className="font-headline text-xl mb-4">Connect With Us</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                <p className="text-sm">
                  <span className="font-semibold">X Style Store:</span> Mirpur 12, Dhaka
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                <p className="text-sm">
                   <span className="font-semibold">Email:</span> 
                   <a href="mailto:xstyle9375@gmail.com" className="text-primary hover:underline ml-1">
                     xstyle9375@gmail.com
                   </a>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                <p className="text-sm">
                  <span className="font-semibold">Order via WhatsApp:</span>
                  <a href="https://wa.me/8801309529592" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                    01309529592
                  </a>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                <p className="text-sm">
                  <span className="font-semibold">Hotline:</span>
                  <a href="tel:+8801677343504" className="text-primary hover:underline ml-1">
                    +880 1677-343504
                  </a>
                </p>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-3">
            <h3 className="font-headline text-xl mb-4">Follow Our Journey</h3>
            <div className="flex space-x-2">
                <Button variant="outline" size="sm" asChild>
                    <Link href="https://www.facebook.com/people/X-STYLE/61575059021306/" target="_blank" rel="noopener noreferrer">Facebook</Link>
                </Button>
                 <Button variant="outline" size="sm" asChild>
                    <Link href="https://www.tiktok.com/@xstyle0025?_t=ZS-8vb0QzuWrmq&_r=1" target="_blank" rel="noopener noreferrer">TikTok</Link>
                </Button>
                 <Button variant="outline" size="sm" asChild>
                    <Link href="https://www.instagram.com/x_style_clothing?igsh=MThhaGZrYjd5dDZhcA%3D%3D" target="_blank" rel="noopener noreferrer">Instagram</Link>
                </Button>
            </div>
            <div className="mt-4 space-x-2">
              <span className="text-sm text-muted-foreground">#XSTYLE_BD</span>
              <span className="text-sm text-muted-foreground">#Mirpur12Fashion</span>
              <span className="text-sm text-muted-foreground">#CountrywideDelivery</span>
            </div>
          </div>

        </div>
        <Separator className="my-6 bg-border/50" />
        <div className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} X Style. All Rights Reserved.
        </div>
      </div>
    </footer>
  )
}
