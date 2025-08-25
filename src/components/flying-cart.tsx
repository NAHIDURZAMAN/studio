"use client"

import { useEffect, useState } from 'react'
import { useCart } from '@/contexts/cart-context'
import { ShoppingCart } from 'lucide-react'

interface FlyingCartProps {
  cartButtonRef?: React.RefObject<HTMLElement>
}

export default function FlyingCart({ cartButtonRef }: FlyingCartProps) {
  const { showArrow } = useCart()
  const [animations, setAnimations] = useState<Array<{
    id: number
    startX: number
    startY: number
    endX: number
    endY: number
  }>>([])

  useEffect(() => {
    const handleShowFlyingCart = (event: CustomEvent) => {
      const sourceElement = event.detail?.sourceElement as Element
      const cartButton = cartButtonRef?.current

      if (sourceElement && cartButton) {
        // Get positions of source button and cart button
        const sourceRect = sourceElement.getBoundingClientRect()
        const cartRect = cartButton.getBoundingClientRect()

        // Calculate start and end positions
        const startX = sourceRect.left + sourceRect.width / 2
        const startY = sourceRect.top + sourceRect.height / 2
        const endX = cartRect.left + cartRect.width / 2
        const endY = cartRect.top + cartRect.height / 2

        // Create new animation
        const newAnimation = {
          id: Date.now(),
          startX,
          startY,
          endX,
          endY
        }

        // Add animation
        setAnimations(prev => [...prev, newAnimation])

        // Remove animation after completion
        setTimeout(() => {
          setAnimations(prev => prev.filter(anim => anim.id !== newAnimation.id))
        }, 1000) // 1 second flight time
      }
    }

    // Listen for flying cart event
    window.addEventListener('showFlyingCart', handleShowFlyingCart as EventListener)

    return () => {
      window.removeEventListener('showFlyingCart', handleShowFlyingCart as EventListener)
    }
  }, [cartButtonRef])

  return (
    <>
      {animations.map(animation => (
        <FlyingCartIcon key={animation.id} animation={animation} />
      ))}
    </>
  )
}

function FlyingCartIcon({ animation }: { animation: { startX: number, startY: number, endX: number, endY: number } }) {
  const [currentPos, setCurrentPos] = useState({ x: animation.startX, y: animation.startY })
  
  useEffect(() => {
    // Animate from start to end position
    const startTime = Date.now()
    const duration = 1000 // 1 second
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      const newX = animation.startX + (animation.endX - animation.startX) * easeOut
      const newY = animation.startY + (animation.endY - animation.startY) * easeOut
      
      setCurrentPos({ x: newX, y: newY })
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [animation])

  return (
    <div
      style={{
        position: 'fixed',
        left: `${currentPos.x}px`,
        top: `${currentPos.y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 10000,
        pointerEvents: 'none',
      }}
      className="flying-cart-icon"
    >
      {/* Flying Cart Icon */}
      <div className="relative">
        <ShoppingCart 
          className="w-8 h-8 text-blue-500 animate-bounce" 
          style={{
            filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.8))',
          }}
        />
        
        {/* Glow effect */}
        <div className="absolute inset-0 w-8 h-8 bg-blue-400 rounded-full opacity-30 animate-ping" />
        
        {/* Trail sparkles */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-60" />
        <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.2s' }} />
        <div className="absolute top-0 left-8 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-40" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  )
}
