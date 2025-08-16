import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
           <Image src="/assets/logo.png" alt="X Style Logo" width={60} height={60} />
           <span className="text-2xl font-bold font-headline text-primary">X Style</span>
        </Link>
        <div className="flex items-center gap-2">
            <span className="text-lg font-headline text-accent-foreground opacity-75">Be Your Outfit</span>
        </div>
      </div>
    </header>
  );
}
