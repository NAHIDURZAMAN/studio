"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugSupabase() {
  const [status, setStatus] = useState('Testing connection...')
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic connection
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(3)

        if (error) {
          setStatus(`Error: ${error.message}`)
          console.error('Supabase error:', error)
        } else {
          setStatus(`Success! Found ${data?.length || 0} products`)
          setProducts(data || [])
        }
      } catch (err) {
        setStatus(`Connection failed: ${err}`)
        console.error('Connection error:', err)
      }
    }

    testConnection()
  }, [])

  return (
    <div style={{ padding: '20px', background: '#f0f0f0', margin: '20px', borderRadius: '8px' }}>
      <h3>Supabase Connection Debug</h3>
      <p><strong>Status:</strong> {status}</p>
      <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
      <p><strong>Has API Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Yes' : 'No'}</p>
      
      {products.length > 0 && (
        <div>
          <h4>Sample Products:</h4>
          <ul>
            {products.map((product, index) => (
              <li key={index}>{product.name} - ৳{product.price}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
