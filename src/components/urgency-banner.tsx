import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Megaphone, PackageCheck, Sparkles } from "lucide-react"

export default function UrgencyBanner() {
  const messages = [
    "Limited stock in popular sizes - grab yours now!",
    "Nationwide delivery slots are filling up fast! 🚚",
    "Mirpur store exclusive: Get FREE customization on any tee! ✨"
  ];
  
  // For this example, we'll just show one message. In a real app, this could rotate.
  const message = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-2 text-center text-sm font-medium">
         <p>{message}</p>
      </div>
    </div>
  )
}
