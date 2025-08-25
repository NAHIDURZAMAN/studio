import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shirt, Users, Star, TrendingUp, Heart, Crown } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Collections - X Style Studio',
  description: 'Explore our exclusive t-shirt collections. From trending designs to classic styles, find your perfect fit.',
}

const collections = [
  {
    id: 1,
    name: 'Trending Now',
    description: 'The hottest designs everyone is talking about',
    image: '/assets/logo.png',
    itemCount: 25,
    badge: 'Hot',
    color: 'bg-red-500',
    icon: TrendingUp,
    href: '/?collection=trending'
  },
  {
    id: 2,
    name: 'Classic Collection',
    description: 'Timeless designs that never go out of style',
    image: '/assets/logo.png',
    itemCount: 18,
    badge: 'Classic',
    color: 'bg-blue-500',
    icon: Crown,
    href: '/?collection=classic'
  },
  {
    id: 3,
    name: 'New Arrivals',
    description: 'Fresh designs just added to our store',
    image: '/assets/logo.png',
    itemCount: 12,
    badge: 'New',
    color: 'bg-green-500',
    icon: Shirt,
    href: '/?new_arrivals=true'
  },
  {
    id: 4,
    name: 'Customer Favorites',
    description: 'Most loved designs by our community',
    image: '/assets/logo.png',
    itemCount: 22,
    badge: 'Popular',
    color: 'bg-purple-500',
    icon: Heart,
    href: '/?collection=favorites'
  },
  {
    id: 5,
    name: 'Premium Collection',
    description: 'High-quality premium fabric t-shirts',
    image: '/assets/logo.png',
    itemCount: 15,
    badge: 'Premium',
    color: 'bg-yellow-500',
    icon: Star,
    href: '/?collection=premium'
  },
  {
    id: 6,
    name: 'Community Choice',
    description: 'Designs voted by our amazing community',
    image: '/assets/logo.png',
    itemCount: 20,
    badge: 'Community',
    color: 'bg-indigo-500',
    icon: Users,
    href: '/?collection=community'
  }
]

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/20 pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-headline text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Our Collections
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Discover our carefully curated t-shirt collections. From trending designs to timeless classics, 
              find the perfect style that speaks to your personality.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shirt className="w-4 h-4" />
                <span>100+ Designs</span>
              </div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>Premium Quality</span>
              </div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>Customer Loved</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection) => {
              const IconComponent = collection.icon
              return (
                <Card key={collection.id} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 overflow-hidden">
                  <div className="relative">
                    <div className={`absolute top-4 left-4 z-10`}>
                      <Badge variant="secondary" className={`${collection.color} text-white font-semibold px-3 py-1`}>
                        {collection.badge}
                      </Badge>
                    </div>
                    <div className="relative h-48 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <IconComponent className="w-16 h-16 text-primary/40 group-hover:text-primary/60 transition-colors duration-300" />
                      <div className="absolute bottom-4 right-4 text-white font-bold text-sm bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                        {collection.itemCount} Items
                      </div>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors duration-300">
                      {collection.name}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {collection.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <Button asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Link href={collection.href}>
                        Explore Collection
                        <IconComponent className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-bold mb-6">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Browse our entire catalog or get in touch with us for custom design requests. 
            We're here to help you find your perfect style!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="px-8">
              <Link href="/">
                <Shirt className="mr-2 w-5 h-5" />
                Browse All Products
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8">
              <Link href="/contact">
                <Heart className="mr-2 w-5 h-5" />
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
