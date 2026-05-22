export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  material: string;
  color: string;
  style: string;
  room: string;
  price: number;
  dimensions: string | null;
  description: string | null;
  long_description: string | null;
  image_url: string;
  rating: number | null;
  in_stock: boolean | null;
  featured: boolean | null;
};

export type SavedCustomization = {
  id: string;
  session_id: string;
  product_id: string | null;
  product_name: string | null;
  prompt: string;
  image_url: string;
  original_image_url: string | null;
  settings: Record<string, unknown>;
  created_at: string;
};
