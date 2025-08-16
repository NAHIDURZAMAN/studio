export type Product = {
  id: number;
  name: string;
  category: 'Drop Shoulder Tees' | 'Jerseys' | 'Hoodies' | 'Basic Collection';
  price: number;
  color: 'Black' | 'White' | 'Navy' | 'Grey';
  image: string;
  stock: number;
  description: string;
  dataAiHint?: string;
};

export type Filters = {
  categories: string[];
  colors: string[];
  priceRange: string;
};

export type CheckoutDetails = {
  name: string;
  phone: string;
  email?: string;
  address: string;
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'trust' | 'brac';
  deliveryLocation: 'dhaka' | 'outside';
  transactionId?: string;
};
