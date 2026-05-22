CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  material TEXT NOT NULL,
  color TEXT NOT NULL,
  style TEXT NOT NULL,
  room TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  dimensions TEXT,
  description TEXT,
  long_description TEXT,
  image_url TEXT NOT NULL,
  rating NUMERIC(2,1) DEFAULT 4.5,
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products are public" ON public.products FOR SELECT USING (true);

CREATE TABLE public.saved_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  original_image_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.saved_customizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved public read" ON public.saved_customizations FOR SELECT USING (true);
CREATE POLICY "saved public insert" ON public.saved_customizations FOR INSERT WITH CHECK (true);
CREATE POLICY "saved public delete" ON public.saved_customizations FOR DELETE USING (true);
CREATE INDEX idx_saved_session ON public.saved_customizations(session_id);

CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, product_id)
);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fav public read" ON public.favorites FOR SELECT USING (true);
CREATE POLICY "fav public insert" ON public.favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "fav public delete" ON public.favorites FOR DELETE USING (true);
CREATE INDEX idx_fav_session ON public.favorites(session_id);

INSERT INTO public.products (slug,name,category,material,color,style,room,price,dimensions,description,long_description,image_url,rating,featured) VALUES
('linen-lounge-sofa','Linen Lounge Sofa','Sofas','Linen','Sand','Modern','Living Room',1890,'220 x 95 x 82 cm','Deep-seated three-seater wrapped in natural linen.','Sink into the Linen Lounge Sofa, designed for slow afternoons. A solid oak frame supports premium foam cushions and a hand-stitched linen cover that softens beautifully with time.','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80',4.8,true),
('oak-dining-table','Oak Dining Table','Tables','Solid Oak','Natural','Scandinavian','Dining Room',1490,'200 x 95 x 75 cm','Hand-finished solid oak dining table for six.','Crafted from sustainably-sourced European oak, this table features hand-rubbed oil finish that highlights the natural grain.','https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200&q=80',4.9,true),
('boucle-accent-chair','Bouclé Accent Chair','Chairs','Bouclé','Cream','Contemporary','Living Room',790,'78 x 82 x 75 cm','Cocooning bouclé armchair with brass legs.','A sculptural silhouette that brings warmth to any corner. Slow-foam padding and a hand-tufted bouclé textile.','https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200&q=80',4.7,true),
('walnut-bookshelf','Walnut Bookshelf','Storage','Walnut','Dark Brown','Mid-Century','Office',1290,'180 x 200 x 35 cm','Five-tier walnut shelving with tapered legs.','Inspired by 1960s Danish design, this open shelving system showcases your collection without overwhelming the room.','https://images.unsplash.com/photo-1594620302200-9a762244a156?w=1200&q=80',4.6,false),
('platform-bed','Platform Bed Frame','Beds','Ash Wood','Honey','Japandi','Bedroom',1650,'200 x 180 x 35 cm','Low-profile platform bed in pale ash.','Inspired by Japanese sleeping floors, this low bed creates a grounded, calm atmosphere. Slatted base, no box spring required.','https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80',4.8,true),
('marble-coffee-table','Marble Coffee Table','Tables','Marble & Brass','White','Luxury','Living Room',980,'120 x 60 x 40 cm','Carrara marble top on brushed brass base.','A statement centerpiece — genuine Carrara marble paired with warm brushed brass for an elegant focal point.','https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=1200&q=80',4.7,false),
('rattan-lounge-chair','Rattan Lounge Chair','Chairs','Rattan','Natural','Bohemian','Living Room',650,'80 x 85 x 85 cm','Hand-woven rattan with linen cushion.','Each chair is hand-woven by master artisans. The breathable rattan and removable linen cushion make it perfect year-round.','https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=1200&q=80',4.5,false),
('velvet-ottoman','Velvet Storage Ottoman','Storage','Velvet','Sage','Contemporary','Living Room',420,'90 x 45 x 42 cm','Soft velvet ottoman with hidden storage.','Plush velvet with a hinged lid revealing generous hidden storage. Doubles as extra seating.','https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=80',4.4,false),
('teak-sideboard','Teak Sideboard','Storage','Teak','Warm Brown','Mid-Century','Dining Room',1750,'180 x 80 x 45 cm','Classic teak sideboard with sliding doors.','Reclaimed teak with hand-cast brass pulls. Three sliding doors hide adjustable shelving.','https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&q=80',4.8,false),
('linen-headboard-bed','Linen Headboard Bed','Beds','Linen & Oak','Stone','Modern','Bedroom',1890,'200 x 180 x 130 cm','Upholstered linen headboard on oak frame.','A tall, channel-tufted linen headboard creates a luxurious focal point. Solid oak frame, premium slat base.','https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80',4.9,true),
('writing-desk','Walnut Writing Desk','Tables','Walnut','Dark Brown','Mid-Century','Office',890,'140 x 70 x 75 cm','Slim writing desk with two drawers.','A clean-lined desk inspired by mid-century studios. Two soft-close drawers and integrated cable management.','https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=1200&q=80',4.6,false),
('outdoor-lounge','Teak Outdoor Lounger','Chairs','Teak','Natural','Coastal','Outdoor',1290,'200 x 70 x 60 cm','Adjustable teak lounger with cushion.','Marine-grade teak engineered to weather beautifully. Five-position back, includes weather-resistant cushion.','https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80',4.7,false);