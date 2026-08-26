export interface Category {
  _id: string;
  name: string;
  description?: string;
}

export interface ProductVariant {
  size?: string;
  color?: string;
  stock: number;
  sku?: string;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  description?: string;
  category: Category | string;
  stock: number;
  variants: ProductVariant[];
  ratingsAverage: number;
  ratingsQuantity: number;
  discountPercentage?: number;
  imageCover?: string;
  images?: string[];
  createdAt?: string;
}

export interface ProductListResponse {
  status: string;
  results: number;
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  data: { products: Product[] };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "moderator" | "admin";
  isVerified?: boolean;
  wishlist?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id?: string;
  user?: string;
  items: CartItem[];
}

export interface Review {
  _id: string;
  review: string;
  rating: number;
  product: string;
  user: { _id: string; name: string } | string;
  createdAt?: string;
}

export interface ShippingAddress {
  address: string;
  city: string;
  phone: string;
}

export interface OrderItem {
  product: string;
  name?: string;
  quantity: number;
  price: number;
  sku?: string;
}

export interface Order {
  _id: string;
  user: string;
  orderItems?: OrderItem[];
  items?: OrderItem[];
  shippingAddress: ShippingAddress;
  totalPrice: number;
  subtotal?: number;
  discountAmount?: number;
  isPaid?: boolean;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt?: string;
}

export interface ApiError {
  status: string;
  message: string;
}
