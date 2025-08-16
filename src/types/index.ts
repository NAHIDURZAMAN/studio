export type Product = {
  id: number;
  name: string;
  category: 'Drop Shoulder Tees' | 'Jerseys' | 'Hoodies' | 'Basic Collection';
  price: number;
  color: 'Black' | 'White' | 'Navy' | 'Grey' | 'Other';
  images: string[];
  stock: number;
  description: string;
  data_ai_hint?: string;
};

export type Filters = {
  categories: string[];
  colors: string[];
  priceRange: string;
};

export type Order = {
  id: number;
  order_id: string;
  created_at: string;
  product_id: number;
  quantity: number;
  total_price: number;
  delivery_charge: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address: string;
  payment_method: string;
  delivery_location?: 'dhaka' | 'outside';
  transaction_id?: string;
  order_status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  products: { // This comes from the join query
    name: string;
  } | null;
}
