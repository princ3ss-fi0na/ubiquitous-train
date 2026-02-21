export type OrderStatus = "pending" | "confirmed" | "packing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  partNumber: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  trackingNumber: string;
  trackingCarrier: string;
  customerName: string;
  customerPhone: string;
  customerRegion: string;
  customerAddress: string;
  customerCity: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  telegramId: number | null;
}

const STORAGE_KEY = "cartech_orders";

export function generateOrderId(): string {
  const d = new Date();
  const prefix = `CT${d.getFullYear().toString().slice(-2)}${String(d.getMonth() + 1).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${rand}`;
}

export function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function createOrder(data: Omit<Order, "id" | "status" | "trackingNumber" | "trackingCarrier" | "createdAt" | "updatedAt">): Order {
  const order: Order = {
    ...data,
    id: generateOrderId(),
    status: "pending",
    trackingNumber: "",
    trackingCarrier: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const orders = loadOrders();
  orders.unshift(order);
  saveOrders(orders);
  return order;
}

export function updateOrderStatus(orderId: string, status: OrderStatus, trackingNumber?: string, trackingCarrier?: string): Order | null {
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return null;
  orders[idx].status = status;
  orders[idx].updatedAt = new Date().toISOString();
  if (trackingNumber !== undefined) orders[idx].trackingNumber = trackingNumber;
  if (trackingCarrier !== undefined) orders[idx].trackingCarrier = trackingCarrier;
  saveOrders(orders);
  return orders[idx];
}

export const CANCEL_WINDOW_MS = 90_000; // 1.5 минуты

export function canCancelOrder(order: Order): boolean {
  if (order.status !== "pending") return false;
  return Date.now() - new Date(order.createdAt).getTime() < CANCEL_WINDOW_MS;
}

export function getCancelSecondsLeft(order: Order): number {
  const elapsed = Date.now() - new Date(order.createdAt).getTime();
  return Math.max(0, Math.ceil((CANCEL_WINDOW_MS - elapsed) / 1000));
}

export function cancelOrder(orderId: string): Order | null {
  const orders = loadOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return null;
  if (!canCancelOrder(orders[idx])) return null;
  orders[idx].status = "cancelled";
  orders[idx].updatedAt = new Date().toISOString();
  saveOrders(orders);
  return orders[idx];
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Ожидает подтверждения",
  confirmed: "Подтверждён",
  packing: "Собирается",
  shipped: "Отправлен",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "text-yellow-400",
  confirmed: "text-blue-400",
  packing: "text-purple-400",
  shipped: "text-amber-400",
  delivered: "text-green-400",
  cancelled: "text-red-400",
};
