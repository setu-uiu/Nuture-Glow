import { apiFetch } from './api';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  district: string;
  area: string;
  streetAddress: string;
  notes?: string;
}

export interface Order {
  id: string;
  userId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress | string;
  deliveryFee: number;
  subtotal: number;
  total: number;
  notes?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod?: string;
  orderDate: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  pharmacyNotes?: string;
  updatedAt?: string;
}

export interface CreateOrderPayload {
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  deliveryFee: number;
  notes?: string;
  paymentMethod?: string;
}

export class OrderService {
  static async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const response = await apiFetch<{ order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.order;
  }

  static async getMyOrders(page = 1, pageSize = 20): Promise<Order[]> {
    const response = await apiFetch<{ data?: Order[]; items?: Order[]; meta?: any }>(
      `/api/orders?page=${page}&pageSize=${pageSize}`
    );
    return response.data || response.items || [];
  }

  static async getOrderById(orderId: string): Promise<Order> {
    const response = await apiFetch<{ data?: Order; order?: Order }>(`/api/orders/${orderId}`);
    return response.data || response.order || (response as any);
  }

  static async cancelOrder(orderId: string): Promise<Order> {
    const response = await apiFetch<{ data?: Order; order?: Order }>(`/api/orders/${orderId}/cancel`, {
      method: 'PATCH',
    });
    return response.data || response.order || (response as any);
  }
}
