import { createClient } from "@/lib/supabase/server";

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  price: number;
  old_price: number | null;
  image: string;
  badge: string | null;
};

type DatabaseProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  price: number | string;
  old_price: number | string | null;
  image_url: string | null;
  image_urls: string[] | null;
  badge: string | null;
  is_published: boolean;
  categories: { name: string } | { name: string }[] | null;
};

export async function getPublishedProducts(): Promise<StoreProduct[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        description,
        category_id,
        price,
        old_price,
        image_url,
        image_urls,
        badge,
        is_published,
        categories ( name )
      `)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Could not load store products:", error.message);
      return [];
    }

    return ((data ?? []) as unknown as DatabaseProduct[]).map((product) => {
      const category = Array.isArray(product.categories)
        ? product.categories[0]
        : product.categories;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        category: category?.name ?? "Furniture",
        price: Number(product.price),
        old_price:
          product.old_price === null ? null : Number(product.old_price),
        image:
          product.image_url ||
          product.image_urls?.[0] ||
          "",
        badge: product.badge,
      };
    });
  } catch (error) {
    console.error("Supabase product connection failed:", error);
    return [];
  }
}
