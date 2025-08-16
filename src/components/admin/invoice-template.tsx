import * as React from 'react';
import type { Order } from '@/types';
import { format } from 'date-fns';

type InvoiceTemplateProps = {
  order: Order;
};

export default function InvoiceTemplate({ order }: InvoiceTemplateProps) {
  const grandTotal = order.total_price + order.delivery_charge;

  return (
    <div className="bg-white text-black p-12 font-sans" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Header */}
      <div className="flex justify-between items-start pb-8 border-b-2 border-gray-200">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">INVOICE</h1>
          <p className="text-gray-500">Invoice #: {order.order_id}</p>
          <p className="text-gray-500">Date: {format(new Date(order.created_at), 'PPP')}</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold">X Style</h2>
          <p className="text-gray-600">Mirpur 12, Dhaka</p>
          <p className="text-gray-600">xstyle9375@gmail.com</p>
          <p className="text-gray-600">01309529592</p>
        </div>
      </div>

      {/* Bill To */}
      <div className="py-8">
        <h3 className="font-semibold text-gray-700 mb-2">BILL TO:</h3>
        <p className="font-bold text-lg">{order.customer_name}</p>
        <p>{order.customer_address}</p>
        <p>{order.customer_phone}</p>
        {order.secondary_phone && <p>{order.secondary_phone}</p>}
        <p>{order.customer_email}</p>
      </div>

      {/* Order Table */}
      <div className="w-full">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
              <th className="py-3 px-4 font-semibold">Product</th>
              <th className="py-3 px-4 font-semibold text-center">Size</th>
              <th className="py-3 px-4 font-semibold text-center">Qty</th>
              <th className="py-3 px-4 font-semibold text-right">Unit Price</th>
              <th className="py-3 px-4 font-semibold text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-4 px-4">{order.products?.name || 'Product'}</td>
              <td className="py-4 px-4 text-center">{order.size}</td>
              <td className="py-4 px-4 text-center">{order.quantity}</td>
              <td className="py-4 px-4 text-right">৳{order.total_price / order.quantity}</td>
              <td className="py-4 px-4 text-right">৳{order.total_price.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end pt-8">
        <div className="w-full max-w-xs text-gray-700">
          <div className="flex justify-between py-2">
            <span className="font-semibold">Subtotal</span>
            <span>৳{order.total_price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-semibold">Delivery Charge</span>
            <span>৳{order.delivery_charge.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-3 mt-2 border-t-2 border-gray-300">
            <span className="font-bold text-lg">Grand Total</span>
            <span className="font-bold text-lg">৳{grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center pt-16 mt-16 border-t-2 border-gray-200 text-gray-500 text-sm">
        <p>Thank you for your business!</p>
        <p>For any inquiries, please contact us at xstyle9375@gmail.com.</p>
      </div>
    </div>
  );
}
