import { Card, CardContent } from "./ui/card";
import { Gift, Percent, Store, Truck } from 'lucide-react';

export default function IncentivesBanner() {
  const incentives = [
    {
      icon: <Truck className="h-8 w-8 text-primary" />,
      title: "Free Mirpur Delivery",
      description: "On orders over ৳1500.",
    },
    {
      icon: <Percent className="h-8 w-8 text-primary" />,
      title: "15% Off First Order",
      description: "For new online customers.",
    },
    {
      icon: <Store className="h-8 w-8 text-primary" />,
      title: "Store Pickup Cashback",
      description: "Get rewarded for visiting us.",
    },
  ];

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {incentives.map((incentive, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  {incentive.icon}
                </div>
                <h3 className="font-headline text-lg font-semibold">{incentive.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{incentive.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
