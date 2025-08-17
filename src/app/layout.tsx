import type {Metadata} from 'next';
import './globals.css';
import { PT_Sans, Belleza, Alegreya } from 'next/font/google';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  className: 'font-sans',
})

const belleza = Belleza({
  subsets: ['latin'],
  weight: ['400'],
  className: 'font-headline',
})

const alegreya = Alegreya({
  subsets: ['latin'],
  weight: ['400', '700'],
  className: 'font-alegreya',
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
    <html lang="en" className={`${ptSans.className} ${belleza.className} ${alegreya.className}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
