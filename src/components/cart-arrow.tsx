"use client"

import { useEffect, useState } from 'react'
import { useCart } from '@/contexts/cart-context'

interface CartArrowProps {
  cartButtonRef?: React.RefObject<HTMLElement>
}

export default function CartArrow({ cartButtonRef }: CartArrowProps) {
  const { showArrow } = useCart()
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleShowArrow = (event: CustomEvent) => {
      const sourceElement = event.detail?.sourceElement as Element
      const cartButton = cartButtonRef?.current

      if (sourceElement && cartButton) {
        // Get positions of source and cart button
        const sourceRect = sourceElement.getBoundingClientRect()
        const cartRect = cartButton.getBoundingClientRect()

        // Calculate arrow position and angle
        const startX = sourceRect.left + sourceRect.width / 2
        const startY = sourceRect.top + sourceRect.height / 2
        const endX = cartRect.left + cartRect.width / 2
        const endY = cartRect.top + cartRect.height / 2

        // Calculate distance and angle
        const deltaX = endX - startX
        const deltaY = endY - startY
        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2)
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)

        // Set arrow styles
        setArrowStyle({
          position: 'fixed',
          left: `${startX}px`,
          top: `${startY}px`,
          width: `${distance}px`,
          height: '4px', // Made slightly thicker
          background: 'linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6)', // Brighter colors
          transformOrigin: 'left center',
          transform: `rotate(${angle}deg)`,
          zIndex: 9999,
          borderRadius: '3px',
          boxShadow: '0 0 15px rgba(16, 185, 129, 0.7), 0 0 25px rgba(59, 130, 246, 0.5)', // Enhanced glow
          pointerEvents: 'none',
          animation: 'arrowDraw 0.8s ease-out forwards', // Draw animation
        })

        setIsVisible(true)

        // Hide arrow after animation
        setTimeout(() => {
          setIsVisible(false)
        }, 1800)
      }
    }

    // Listen for arrow show event
    window.addEventListener('showCartArrow', handleShowArrow as EventListener)

    return () => {
      window.removeEventListener('showCartArrow', handleShowArrow as EventListener)
    }
  }, [cartButtonRef])

  if (!showArrow || !isVisible) return null

  return (
    <>
      {/* Arrow Line */}
      <div
        style={arrowStyle}
        className="animate-pulse"
      />
      
      {/* Arrow Head */}
      <div
        style={{
          position: 'fixed',
          left: `${parseFloat(arrowStyle.left as string) + parseFloat(arrowStyle.width as string) - 18}px`,
          top: `${parseFloat(arrowStyle.top as string) - 10}px`,
          width: '0',
          height: '0',
          borderLeft: '18px solid #3b82f6', // Larger arrow head
          borderTop: '10px solid transparent',
          borderBottom: '10px solid transparent',
          transform: `rotate(${parseFloat((arrowStyle.transform as string).match(/rotate\(([^)]+)\)/)?.[1] || '0')}deg)`,
          transformOrigin: 'left center',
          zIndex: 10000,
          filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))', // Stronger glow
          pointerEvents: 'none',
          animation: 'arrowHeadPop 0.3s ease-out 0.8s forwards', // Delayed appearance
          opacity: 0,
        }}
      />

      {/* Floating particles along the arrow */}
      <div
        style={{
          ...arrowStyle,
          background: 'none',
          overflow: 'visible',
        }}
        className="pointer-events-none"
      >
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${(i + 1) * 20}%`,
              top: '-2px',
              width: '4px',
              height: '4px',
              background: '#fbbf24',
              borderRadius: '50%',
              animation: `sparkleMove 1.5s ease-out ${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Text indicator */}
      <div
        style={{
          position: 'fixed',
          left: `${parseFloat(arrowStyle.left as string) + parseFloat(arrowStyle.width as string) / 2}px`,
          top: `${parseFloat(arrowStyle.top as string) - 40}px`,
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #10b981, #3b82f6)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 10001,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
        className="animate-bounce"
      >
        🎯 Added to Cart! 🛒
      </div>
    </>
  )
}
