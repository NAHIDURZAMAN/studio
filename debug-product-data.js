// Debug component - Add this temporarily to see product data
// Copy this code and paste it at the top of your product card component

console.log("Product data:", {
  name: product.name,
  price: product.price,
  discount_percentage: product.discount_percentage,
  discount_price: product.discount_price,
  hasDiscount: product.discount_percentage > 0
});

// If you see undefined for discount fields, you need to add database columns
