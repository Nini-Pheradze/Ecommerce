export interface Category {
  _id: string;
  name: string;
  description?: string;
}

export interface ProductVariant {
  size?: string;
  color?: string;
  stock?: number;
  sku?: string;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  discountPercentage?: number;
  description?: string;
  imageCover?: string | null;
  images?: string[];
  category: Category | string;
  seller?: Pick<User, '_id' | 'name'> | string;
  stock: number;
  variants?: ProductVariant[];
  ratingsAverage: number;
  ratingsQuantity: number;
  createdAt?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
  isVerified?: boolean;
  isBlocked?: boolean;
  warningsCount?: number;
  twoFactorEnabled?: boolean;
  phoneNumber?: string;
  googleId?: string;
  wishlist?: string[];
  createdAt?: string;
}

export interface CartItem {
  _id?: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  _id?: string;
  user?: string;
  items: CartItem[];
}

export interface ShippingAddress {
  address: string;
  city: string;
  phone: string;
}

export interface OrderItem {
  product: string;
  name?: string;
  sku?: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  user: string | Pick<User, '_id' | 'name' | 'email'>;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  totalPrice: number;
  isPaid: boolean;
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export interface Review {
  _id: string;
  review: string;
  rating: number;
  product: string;
  user: { _id: string; name: string } | string;
  createdAt: string;
}

export interface SupportMessage {
  _id: string;
  sender: { _id: string; name: string; role?: string } | string;
  text: string;
  createdAt: string;
}

export interface SupportTicket {
  _id: string;
  user: { _id: string; name: string; email: string } | string;
  subject: string;
  status: 'open' | 'closed';
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiListResponse<T> {
  status: string;
  results: number;
  totalProducts?: number;
  currentPage?: number;
  totalPages?: number;
  data: T;
}

export interface ApiResponse<T> {
  status: string;
  message?: string;
  token?: string;
  data: T;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  sort?: string;
  category?: string;
  size?: string;
  color?: string;
  onSale?: string;
  'price[gte]'?: number;
  'price[lte]'?: number;
}
