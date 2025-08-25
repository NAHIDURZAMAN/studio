"use client"

import { useState } from 'react'
import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare, 
  Heart,
  Facebook,
  Instagram,
  Twitter,
  MessageCircle,
  Loader2
} from 'lucide-react'

const contactInfo = [
  {
    icon: Phone,
    title: 'Hotline',
    details: '+880 1677-343504',
    description: 'Call us for instant support',
    color: 'text-green-500'
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Orders',
    details: '01309529592',
    description: 'Order directly via WhatsApp',
    color: 'text-green-600'
  },
  {
    icon: Mail,
    title: 'Email',
    details: 'xstyle9375@gmail.com',
    description: 'Send us your queries anytime',
    color: 'text-blue-500'
  },
  {
    icon: MapPin,
    title: 'Store Location',
    details: 'Mirpur 12, Dhaka',
    description: 'We ship style to every corner of Bangladesh',
    color: 'text-red-500'
  },
  {
    icon: Clock,
    title: 'Business Hours',
    details: '9 AM - 9 PM (Daily)',
    description: 'We\'re available 7 days a week',
    color: 'text-purple-500'
  }
]

const socialLinks = [
  {
    icon: Facebook,
    name: 'Facebook',
    url: 'https://facebook.com/xstylestudio',
    color: 'text-blue-600 hover:text-blue-700'
  },
  {
    icon: Instagram,
    name: 'TikTok',
    url: 'https://tiktok.com/@xstylestudio',
    color: 'text-pink-500 hover:text-pink-600'
  },
  {
    icon: MessageCircle,
    name: 'WhatsApp',
    url: 'https://wa.me/8801309529592',
    color: 'text-green-500 hover:text-green-600'
  },
  {
    icon: Mail,
    name: 'Email',
    url: 'mailto:xstyle9375@gmail.com',
    color: 'text-blue-400 hover:text-blue-500'
  }
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      console.log('Attempting to send message:', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        subject: formData.subject,
        message: formData.message,
        status: 'unread'
      })

      const { error, data } = await supabase
        .from('messages')
        .insert([
          {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone || null,
            subject: formData.subject,
            message: formData.message,
            status: 'unread'
          }
        ])
        .select()

      console.log('Supabase response:', { data, error })

      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }

      toast({
        title: "Message Sent Successfully! 🎉",
        description: "We've received your message and will get back to you within 24 hours.",
      })

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })

    } catch (error) {
      console.error('Error sending message:', error)
      
      // More detailed error message
      let errorMessage = "There was an error sending your message. Please try again."
      
      if (error && typeof error === 'object') {
        if ('message' in error) {
          errorMessage = `Database error: ${error.message}`
        }
        if ('code' in error && error.code === 'PGRST116') {
          errorMessage = "The messages table doesn't exist. Please contact the admin to set up the database."
        }
      }
      
      toast({
        variant: "destructive",
        title: "Failed to Send Message",
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/20 pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-headline text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Contact Us
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Be Your Outfit. We ship style to every corner of Bangladesh. Whether you have questions about our t-shirts, 
              need help with your order, or want to discuss custom designs, we're here to help.
            </p>
            <Badge variant="secondary" className="bg-primary/10 text-primary px-4 py-2 text-sm font-semibold">
              <Heart className="w-4 h-4 mr-1" />
              Customer satisfaction is our priority
            </Badge>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card className="shadow-xl border-2 hover:border-primary/20 transition-all duration-300">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  Send us a Message
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input 
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter your first name"
                        className="focus:border-primary transition-colors"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input 
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter your last name"
                        className="focus:border-primary transition-colors"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input 
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      className="focus:border-primary transition-colors"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+880 1234-567890"
                      className="focus:border-primary transition-colors"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input 
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="How can we help you?"
                      className="focus:border-primary transition-colors"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea 
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us more about your inquiry, custom design ideas, or any questions you have..."
                      className="min-h-[120px] focus:border-primary transition-colors resize-none"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    * Required fields. We respect your privacy and never share your information.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-center lg:text-left">Get in Touch</h2>
              <div className="grid gap-6">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon
                  let href = ""
                  
                  // Make contact info clickable
                  if (info.title === 'Hotline') {
                    href = "tel:+8801677343504"
                  } else if (info.title === 'WhatsApp Orders') {
                    href = "https://wa.me/8801309529592"
                  } else if (info.title === 'Email') {
                    href = "mailto:xstyle9375@gmail.com"
                  }
                  
                  return (
                    <Card key={index} className="border-2 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                      <CardContent className="flex items-center gap-4 p-6">
                        <div className={`p-3 rounded-full bg-secondary ${info.color}`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{info.title}</h3>
                          {href ? (
                            <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} className="text-primary font-medium hover:underline">
                              {info.details}
                            </a>
                          ) : (
                            <p className="text-primary font-medium">{info.details}</p>
                          )}
                          <p className="text-sm text-muted-foreground">{info.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Social Media */}
            <Card className="border-2 hover:border-primary/20 transition-all duration-300">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Follow Us</CardTitle>
                <CardDescription>
                  Stay connected for updates, new designs, and special offers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center gap-4">
                  {socialLinks.map((social, index) => {
                    const IconComponent = social.icon
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        size="icon"
                        className={`hover:scale-110 transition-all duration-300 ${social.color}`}
                        asChild
                      >
                        <a href={social.url} target="_blank" rel="noopener noreferrer">
                          <IconComponent className="w-5 h-5" />
                        </a>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="border-2 hover:border-primary/20 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-center">Quick Answers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">📦 Delivery Time</h4>
                  <p className="text-sm text-muted-foreground">2-3 days in Dhaka, 4-7 days outside Dhaka</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">💰 Payment Methods</h4>
                  <p className="text-sm text-muted-foreground">bKash, Nagad, Cash on Delivery</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">📏 Size Guide</h4>
                  <p className="text-sm text-muted-foreground">S, M, L, XL, XXL available for all designs</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">🎨 Custom Designs</h4>
                  <p className="text-sm text-muted-foreground">Yes! Contact us for personalized t-shirt designs</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">📍 Store Location</h4>
                  <p className="text-sm text-muted-foreground">Visit us at Mirpur 12, Dhaka for in-person shopping</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">📱 Quick Order</h4>
                  <p className="text-sm text-muted-foreground">
                    <a href="https://wa.me/8801309529592" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      WhatsApp us at 01309529592
                    </a> for instant ordering
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Your Perfect T-Shirt?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Browse our amazing collection or contact us for custom designs. 
            We're excited to create something special just for you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="px-8">
              <a href="/">
                <Heart className="mr-2 w-5 h-5" />
                Shop Now
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8">
              <a href="/collections">
                Browse Collections
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
