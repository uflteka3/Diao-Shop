// Types du modèle de données — alignés sur les tables Supabase prévues en Phase 8.
export type ThemeMode = 'light' | 'dark';

/** Thème visuel lié à un produit (table `product_themes`). */
export interface ProductTheme {
  backgroundColor: string; // --ds-bg        (arrière-plan extérieur)
  surfaceGradient: string; // --ds-gradient  (surface de la carte)
  primaryColor: string; // --ds-primary
  secondaryColor: string; // --ds-secondary (fond solide de la carte sous le dégradé)
  accentColor: string; // --ds-accent
  textColor: string; // --ds-text
  mutedTextColor: string; // --ds-muted
  buttonColor: string; // --ds-button
  glowColor: string; // --ds-glow
  glowIntensity: number; // --ds-glow-intensity (0 → 1)
  borderColor: string; // --ds-border
  mode: ThemeMode;
}

export interface ProductSize {
  size: string;
  stock: number;
  active: boolean;
}

/** Produit (table `products` + jointures images/tailles). */
export interface Product {
  id: string;
  slug: string;
  name: string;
  subTitle: string; // 2e ligne du titre (édition / équipe)
  team: string;
  shortDescription: string;
  description: string;
  price: number;
  oldPrice: number | null;
  currency: string;
  mainImage: string;
  gallery?: string[]; // images secondaires (product_images)
  altText: string;
  sizes: ProductSize[];
  published: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  size: string;
  quantity: number;
  unitPrice: number;
  image: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
}

export interface DeliveryZone {
  id: string;
  label: string;
  fee: number;
}

export interface DeliverySettings {
  zones: DeliveryZone[];
}

export interface PaymentSettings {
  method: string;
  label: string;
  instructions: string;
}

/** Paramètres boutique (table `shop_settings`). */
export interface ShopSettings {
  shopName: string;
  slogan: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  socialLinks: SocialLinks;
  currency: string;
  deliverySettings: DeliverySettings;
  paymentSettings: PaymentSettings;
  aboutText?: string;
  contactText?: string;
}

/** Ligne de commande (table `order_items` — snapshots immuables). */
export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus = 'nouvelle' | 'confirmee' | 'en_preparation' | 'expediee' | 'livree' | 'annulee' | 'remboursee';

/** Commande (table `orders`). */
export interface Order {
  orderNumber: string;
  customerName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: string;
  city: string;
  zoneLabel: string;
  deliveryMethod: string;
  paymentMethod: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  status: OrderStatus;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  lu: boolean;
  createdAt: string;
}
