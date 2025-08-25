"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Product } from '@/types'

interface CartItem {
  product: Product
  quantity: number
  size: string
  selected_price: number // Store the price at time of adding to cart (discount or regular)
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, size: string, quantity?: number) => void
  removeFromCart: (productId: number, size: string) => void
  updateQuantity: (productId: number, size: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  getDeliveryCharge: (location: 'dhaka' | 'outside') => number
  getGrandTotal: (location: 'dhaka' | 'outside', paymentMethod: string) => number
  isAnimating: boolean
  triggerAnimation: () => void
  showArrow: boolean
  triggerArrow: (sourceElement?: Element) => void
  triggerFlyingCart: (sourceElement: Element) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [showArrow, setShowArrow] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('xstyle-cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('xstyle-cart', JSON.stringify(items))
  }, [items])

  const addToCart = (product: Product, size: string, quantity = 1) => {
    // Calculate the price to store (discount price if available, otherwise regular price)
    const selected_price = product.discount_price && product.discount_price > 0 
      ? product.discount_price 
      : product.price

    setItems(current => {
      // Check if item with same product and size already exists
      const existingIndex = current.findIndex(
        item => item.product.id === product.id && item.size === size
      )

      if (existingIndex >= 0) {
        // Update quantity of existing item
        const newItems = [...current]
        newItems[existingIndex].quantity += quantity
        return newItems
      } else {
        // Add new item
        return [...current, { product, quantity, size, selected_price }]
      }
    })

    // Trigger animation
    triggerAnimation()
  }

  const triggerAnimation = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 600) // Animation duration
  }

  const triggerArrow = (sourceElement?: Element) => {
    setShowArrow(true)
    // Create arrow pointing event
    setTimeout(() => {
      const event = new CustomEvent('showCartArrow', {
        detail: { sourceElement }
      })
      window.dispatchEvent(event)
    }, 100)
    setTimeout(() => setShowArrow(false), 2000) // Show arrow for 2 seconds
  }

  const triggerFlyingCart = (sourceElement: Element) => {
    // Dispatch custom event for flying cart animation
    setTimeout(() => {
      const event = new CustomEvent('showFlyingCart', { 
        detail: { sourceElement } 
      })
      window.dispatchEvent(event)
    }, 100)
    
    setShowArrow(true) // We'll reuse showArrow state for flying cart
    setTimeout(() => setShowArrow(false), 1000) // Hide after 1 second
  }

  const removeFromCart = (productId: number, size: string) => {
    setItems(current => 
      current.filter(item => !(item.product.id === productId && item.size === size))
    )
  }

  const updateQuantity = (productId: number, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size)
      return
    }

    setItems(current =>
      current.map(item =>
        item.product.id === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.selected_price * item.quantity), 0)
  }

  const getDeliveryCharge = (location: 'dhaka' | 'outside') => {
    return location === 'dhaka' ? 70 : 120
  }

  const getGrandTotal = (location: 'dhaka' | 'outside', paymentMethod: string) => {
    const subtotal = getTotalPrice()
    const delivery = getDeliveryCharge(location) // Always include delivery charges
    return subtotal + delivery
  }

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      getDeliveryCharge,
      getGrandTotal,
      isAnimating,
      triggerAnimation,
      showArrow,
      triggerArrow,
      triggerFlyingCart
    }}>
      {children}
    </CartContext.Provider>
  )
}
