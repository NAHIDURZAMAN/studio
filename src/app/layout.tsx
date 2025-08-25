import type {Metadata} from 'next';
import './globals.css';
import { PT_Sans, Belleza, Alegreya } from 'next/font/google';
import { CartProvider } from '@/contexts/cart-context';
import { Toaster } from '@/components/ui/toaster';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
})

const belleza = Belleza({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-headline',
})

const alegreya = Alegreya({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-alegreya',
})

export const metadata: Metadata = {
  title: 'X Style',
  description: 'Bangladeshi urban fashion from Mirpur 12.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ptSans.variable} ${belleza.variable} ${alegreya.variable}`}>
      <body className="font-sans">
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
