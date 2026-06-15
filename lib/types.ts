// Shared types for services and hooks

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  costPrice: number;
  stock: number;
  sku: string;
  images: string[];
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: "ADMIN" | "CUSTOMER";
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: User;
  status: OrderStatus;
  subtotal: number;
  total: number;
  receiptUrl: string | null;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
};

export type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";

export type Sale = {
  id: string;
  saleNumber: string;
  customerName: string | null;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  receiptUrl: string | null;
  items?: SaleItem[];
  createdAt: string;
};

export type SaleItem = {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
};

export type PaymentMethod = "CASH" | "MOBILE_MONEY" | "CARD" | "BANK_TRANSFER";

export type InventoryMovement = {
  id: string;
  productId: string;
  product?: Product;
  type: "IN" | "OUT";
  quantity: number;
  createdAt: string;
};

export type DashboardData = {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  recentOrders: Order[];
  recentSales: Sale[];
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
