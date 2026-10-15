"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  price: number | string;
  old_price: number | string | null;
  image_url: string | null;
  image_urls: string[] | null;
  stock_quantity: number;
  badge: string | null;
  is_published: boolean;
  created_at: string;
};

type ProductForm = {
  name: string;
  description: string;
  category_id: string;
  price: string;
  old_price: string;
  image_url: string;
  stock_quantity: string;
  badge: string;
  is_published: boolean;
};

const emptyForm: ProductForm = {
  name: "",
  description: "",
  category_id: "",
  price: "",
  old_price: "",
  image_url: "",
  stock_quantity: "1",
  badge: "",
  is_published: true,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "12px 14px",
  background: "#050505",
  color: "#ffffff",
  border: "1px solid #333333",
  borderRadius: "5px",
  fontSize: "14px",
  outlineColor: "#ffffff",
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  color: "#c5c5c5",
  marginBottom: "8px",
};

const buttonStyle = {
  padding: "11px 16px",
  background: "#ffffff",
  color: "#050505",
  border: "1px solid #ffffff",
  borderRadius: "5px",
  fontSize: "12px",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  ...buttonStyle,
  background: "#101010",
  color: "#ffffff",
  border: "1px solid #333333",
};

function makeSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function money(value: number | string | null) {
  const amount = Number(value ?? 0);

  return `KSh ${amount.toLocaleString("en-KE", {
    maximumFractionDigits: 2,
  })}`;
}

export default function AdminProductsPage() {
  const [supabase] = useState(() => createClient());
  const [authorized, setAuthorized] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        window.location.replace("/admin/login");
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut();
        window.location.replace("/admin/login");
        return;
      }

      setAuthorized(true);

      const [productResult, categoryResult] = await Promise.all([
        supabase
          .from("products")
          .select(
            "id,name,slug,description,category_id,price,old_price,image_url,image_urls,stock_quantity,badge,is_published,created_at"
          )
          .order("created_at", { ascending: false }),
        supabase
          .from("categories")
          .select("id,name")
          .eq("is_active", true)
          .order("name"),
      ]);

      if (productResult.error) {
        throw new Error(`Products: ${productResult.error.message}`);
      }

      if (categoryResult.error) {
        throw new Error(`Categories: ${categoryResult.error.message}`);
      }

      setProducts((productResult.data ?? []) as Product[]);
      setCategories((categoryResult.data ?? []) as Category[]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not load store data."
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function startNewProduct() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setErrorMessage("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startEditing(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description ?? "",
      category_id: product.category_id ?? "",
      price: String(product.price),
      old_price:
        product.old_price === null ? "" : String(product.old_price),
      image_url: product.image_url ?? product.image_urls?.[0] ?? "",
      stock_quantity: String(product.stock_quantity ?? 0),
      badge: product.badge ?? "",
      is_published: product.is_published,
    });
    setMessage("");
    setErrorMessage("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadImage(file?: File) {
    if (!file) return;

    setMessage("");
    setErrorMessage("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Choose a JPG, PNG, WebP, or AVIF image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("The image must be 5 MB or smaller.");
      return;
    }

    setUploading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        window.location.replace("/admin/login");
        return;
      }

      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${extension}`;

      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(path, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from("product-images")
        .getPublicUrl(data.path);

      setForm((current) => ({
        ...current,
        image_url: publicData.publicUrl,
      }));

      setMessage("Image uploaded. Save the product to apply your changes.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `Image upload failed: ${error.message}`
          : "Image upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    const name = form.name.trim();
    const price = Number(form.price);
    const oldPrice =
      form.old_price.trim() === "" ? null : Number(form.old_price);
    const stock = Number(form.stock_quantity);

    if (!name) {
      setErrorMessage("Enter a product name.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setErrorMessage("Enter a valid price greater than zero.");
      return;
    }

    if (
      oldPrice !== null &&
      (!Number.isFinite(oldPrice) || oldPrice <= price)
    ) {
      setErrorMessage(
        "The original price must be greater than the selling price."
      );
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setErrorMessage("Stock must be a whole number of zero or more.");
      return;
    }

    if (!form.image_url.trim()) {
      setErrorMessage("Upload a product image or provide an image URL.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        window.location.replace("/admin/login");
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminError || !admin) {
        throw new Error("Administrator permission could not be verified.");
      }

      const payload = {
        name,
        slug: makeSlug(name),
        description: form.description.trim() || null,
        category_id: form.category_id || null,
        price,
        old_price: oldPrice,
        image_url: form.image_url.trim(),
        image_urls: [form.image_url.trim()],
        stock_quantity: stock,
        badge: form.badge.trim() || null,
        is_published: form.is_published,
        updated_at: new Date().toISOString(),
      };

      let result;

      if (editingId) {
        result = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingId)
          .select("id")
          .single();
      } else {
        result = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();
      }

      if (result.error) {
        if (result.error.code === "23505") {
          throw new Error(
            "A product with this URL slug already exists. Rename the product and try again."
          );
        }

        throw new Error(result.error.message);
      }

      setMessage(editingId ? "Product updated successfully." : "Product created successfully.");
      setEditingId(null);
      setForm(emptyForm);
      setShowForm(false);
      await loadData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not save the product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(product: Product) {
    const action = product.is_published ? "unpublish" : "publish";

    if (
      !window.confirm(
        `Are you sure you want to ${action} "${product.name}"?`
      )
    ) {
      return;
    }

    setBusyId(product.id);
    setMessage("");
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("products")
        .update({
          is_published: !product.is_published,
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id);

      if (error) throw error;

      setMessage(
        product.is_published
          ? "Product unpublished."
          : "Product published."
      );

      await loadData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not update product."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function deleteProduct(product: Product) {
    if (
      !window.confirm(
        `Permanently delete "${product.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setBusyId(product.id);
    setMessage("");
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (error) throw error;

      setProducts((current) =>
        current.filter((item) => item.id !== product.id)
      );
      setMessage(`"${product.name}" was deleted.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not delete product."
      );
    } finally {
      setBusyId(null);
    }
  }

  const visibleProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.slug.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "published" && product.is_published) ||
      (filter === "draft" && !product.is_published);

    return matchesSearch && matchesFilter;
  });

  const publishedCount = products.filter(
    (product) => product.is_published
  ).length;

  if (!authorized && loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#050505",
          color: "#ffffff",
          display: "grid",
          placeItems: "center",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        Checking administrator access...
      </main>
    );
  }

  if (!authorized) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#050505",
          color: "#ffffff",
          padding: "40px 5%",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <h1>Products</h1>
        <p style={{ color: "#ff9999" }}>
          {errorMessage || "Unable to verify administrator access."}
        </p>
        <button style={buttonStyle} onClick={() => void loadData()}>
          Try again
        </button>
        <p>
          <Link href="/admin/login" style={{ color: "#ffffff" }}>
            Return to admin login
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#ffffff",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <header
        style={{
          padding: "20px 5%",
          borderBottom: "1px solid #333333",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "3px",
            }}
          >
            SMART FURNITURES
          </p>
          <p style={{ margin: "7px 0 0", color: "#999999", fontSize: "12px" }}>
            Product management
          </p>
        </div>

        <nav style={{ display: "flex", gap: "18px", alignItems: "center" }}>
          <Link
            href="/admin/dashboard"
            style={{ color: "#c5c5c5", fontSize: "13px", textDecoration: "none" }}
          >
            Dashboard
          </Link>
          <Link
            href="/"
            style={{ color: "#c5c5c5", fontSize: "13px", textDecoration: "none" }}
          >
            View store
          </Link>
        </nav>
      </header>

      <div style={{ maxWidth: "1450px", margin: "0 auto", padding: "38px 5% 70px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          <div>
            <p
              style={{
                color: "#999999",
                fontSize: "11px",
                letterSpacing: "3px",
                margin: "0 0 10px",
              }}
            >
              STORE INVENTORY
            </p>
            <h1
              style={{
                fontSize: "clamp(30px, 5vw, 44px)",
                margin: 0,
                letterSpacing: "-1px",
              }}
            >
              Products
            </h1>
            <p style={{ color: "#999999", fontSize: "13px", lineHeight: 1.7 }}>
              Manage furniture, pricing, images and availability.
            </p>
          </div>

          <button style={buttonStyle} onClick={startNewProduct}>
            + Add product
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "12px",
            marginBottom: "26px",
          }}
        >
          {[
            ["Total products", products.length],
            ["Published", publishedCount],
            ["Drafts", products.length - publishedCount],
            [
              "Out of stock",
              products.filter((product) => Number(product.stock_quantity) === 0)
                .length,
            ],
          ].map(([label, value]) => (
            <article
              key={String(label)}
              style={{
                padding: "20px",
                background: "#101010",
                border: "1px solid #333333",
                borderRadius: "7px",
              }}
            >
              <p style={{ color: "#999999", fontSize: "12px", margin: 0 }}>
                {label}
              </p>
              <p style={{ fontSize: "30px", fontWeight: 700, margin: "12px 0 0" }}>
                {value}
              </p>
            </article>
          ))}
        </div>

        {message && (
          <p
            role="status"
            style={{
              padding: "13px 15px",
              background: "#101010",
              border: "1px solid #555555",
              color: "#ffffff",
              borderRadius: "5px",
              fontSize: "13px",
            }}
          >
            {message}
          </p>
        )}

        {errorMessage && (
          <p
            role="alert"
            style={{
              padding: "13px 15px",
              background: "#170909",
              border: "1px solid #743333",
              color: "#ffb5b5",
              borderRadius: "5px",
              fontSize: "13px",
              overflowWrap: "anywhere",
            }}
          >
            {errorMessage}
          </p>
        )}

        {showForm && (
          <section
            style={{
              padding: "clamp(18px, 4vw, 30px)",
              background: "#101010",
              border: "1px solid #333333",
              borderRadius: "8px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <h2 style={{ fontSize: "21px", margin: 0 }}>
                {editingId ? "Edit product" : "Add new product"}
              </h2>
              <button
                type="button"
                style={secondaryButtonStyle}
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Close
              </button>
            </div>

            <form onSubmit={saveProduct}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
                  gap: "20px",
                }}
              >
                <div>
                  <label htmlFor="product-name" style={labelStyle}>
                    Product name *
                  </label>
                  <input
                    id="product-name"
                    style={inputStyle}
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="e.g. Modern 5-Seater Sofa"
                    maxLength={160}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="product-category" style={labelStyle}>
                    Category
                  </label>
                  <select
                    id="product-category"
                    style={inputStyle}
                    value={form.category_id}
                    onChange={(event) =>
                      setForm({ ...form, category_id: event.target.value })
                    }
                  >
                    <option value="">Choose category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <p style={{ color: "#999999", fontSize: "12px" }}>
                      No active categories found. You can save without a category.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="product-price" style={labelStyle}>
                    Selling price (KSh) *
                  </label>
                  <input
                    id="product-price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    style={inputStyle}
                    value={form.price}
                    onChange={(event) =>
                      setForm({ ...form, price: event.target.value })
                    }
                    placeholder="25000"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="product-old-price" style={labelStyle}>
                    Original price (KSh, optional)
                  </label>
                  <input
                    id="product-old-price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    style={inputStyle}
                    value={form.old_price}
                    onChange={(event) =>
                      setForm({ ...form, old_price: event.target.value })
                    }
                    placeholder="30000"
                  />
                  <p style={{ color: "#999999", fontSize: "11px" }}>
                    Must be higher than the selling price to show a discount.
                  </p>
                </div>

                <div>
                  <label htmlFor="product-stock" style={labelStyle}>
                    Stock quantity *
                  </label>
                  <input
                    id="product-stock"
                    type="number"
                    min="0"
                    step="1"
                    style={inputStyle}
                    value={form.stock_quantity}
                    onChange={(event) =>
                      setForm({ ...form, stock_quantity: event.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label htmlFor="product-badge" style={labelStyle}>
                    Badge (optional)
                  </label>
                  <input
                    id="product-badge"
                    style={inputStyle}
                    value={form.badge}
                    onChange={(event) =>
                      setForm({ ...form, badge: event.target.value })
                    }
                    placeholder="e.g. BESTSELLER or NEW"
                    maxLength={40}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="product-description" style={labelStyle}>
                    Product description
                  </label>
                  <textarea
                    id="product-description"
                    style={{ ...inputStyle, minHeight: "115px", resize: "vertical" }}
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                    placeholder="Describe the materials, dimensions, colour and other product details."
                    maxLength={5000}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="product-image" style={labelStyle}>
                    Product image *
                  </label>
                  <input
                    id="product-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    disabled={uploading || saving}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      void uploadImage(file);
                      event.currentTarget.value = "";
                    }}
                    style={{
                      ...inputStyle,
                      padding: "10px",
                    }}
                  />
                  <p style={{ color: "#999999", fontSize: "12px", lineHeight: 1.6 }}>
                    JPG, PNG, WebP or AVIF. Maximum 5 MB. Uploads to your
                    Supabase product-images bucket.
                  </p>

                  <label htmlFor="product-image-url" style={labelStyle}>
                    Or enter an existing public image URL
                  </label>
                  <input
                    id="product-image-url"
                    type="url"
                    style={inputStyle}
                    value={form.image_url}
                    onChange={(event) =>
                      setForm({ ...form, image_url: event.target.value })
                    }
                    placeholder="https://..."
                  />

                  {uploading && (
                    <p style={{ color: "#c5c5c5", fontSize: "13px" }}>
                      Uploading image...
                    </p>
                  )}

                  {form.image_url && (
                    <div style={{ marginTop: "15px" }}>
                      <p style={{ color: "#999999", fontSize: "12px" }}>
                        Image preview
                      </p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.image_url}
                        alt="Product preview"
                        style={{
                          width: "180px",
                          height: "140px",
                          objectFit: "cover",
                          background: "#171717",
                          border: "1px solid #333333",
                          borderRadius: "5px",
                        }}
                        onError={(event) => {
                          event.currentTarget.style.opacity = "0.3";
                        }}
                      />
                    </div>
                  )}
                </div>

                <div
                  style={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                    flexWrap: "wrap",
                    borderTop: "1px solid #333333",
                    paddingTop: "20px",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      fontSize: "13px",
                      marginRight: "auto",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.is_published}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          is_published: event.target.checked,
                        })
                      }
                    />
                    Publish on storefront
                  </label>

                  <button
                    type="button"
                    style={secondaryButtonStyle}
                    disabled={saving || uploading}
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setForm(emptyForm);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={{
                      ...buttonStyle,
                      opacity: saving || uploading ? 0.6 : 1,
                    }}
                    disabled={saving || uploading}
                  >
                    {uploading
                      ? "Uploading image..."
                      : saving
                        ? "Saving..."
                        : editingId
                          ? "Save changes"
                          : "Create product"}
                  </button>
                </div>
              </div>
            </form>
          </section>
        )}

        <section
          style={{
            border: "1px solid #333333",
            background: "#101010",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "18px",
              gap: "12px",
              flexWrap: "wrap",
              borderBottom: "1px solid #333333",
            }}
          >
            <input
              aria-label="Search products"
              style={{ ...inputStyle, flex: "1 1 220px", maxWidth: "420px" }}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by product name..."
            />

            <select
              aria-label="Filter products"
              style={{ ...inputStyle, width: "auto", minWidth: "150px" }}
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as "all" | "published" | "draft")
              }
            >
              <option value="all">All products</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>

            <button
              type="button"
              style={secondaryButtonStyle}
              onClick={() => void loadData()}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <p style={{ padding: "30px", color: "#999999" }}>
              Loading products...
            </p>
          ) : visibleProducts.length === 0 ? (
            <div style={{ padding: "35px 20px", textAlign: "center" }}>
              <h2 style={{ fontSize: "19px" }}>No products found</h2>
              <p style={{ color: "#999999", fontSize: "13px", lineHeight: 1.7 }}>
                Add your first real furniture product, or change your search
                and filter.
              </p>
              {products.length === 0 && (
                <button style={buttonStyle} onClick={startNewProduct}>
                  + Add your first product
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  minWidth: "760px",
                  borderCollapse: "collapse",
                  textAlign: "left",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr style={{ background: "#171717", color: "#999999" }}>
                    {[
                      "Product",
                      "Price",
                      "Stock",
                      "Status",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          padding: "15px",
                          fontWeight: 500,
                          borderBottom: "1px solid #333333",
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleProducts.map((product) => {
                    const image =
                      product.image_url || product.image_urls?.[0] || "";

                    return (
                      <tr key={product.id}>
                        <td
                          style={{
                            padding: "14px",
                            borderBottom: "1px solid #252525",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "13px",
                              minWidth: "230px",
                            }}
                          >
                            {image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={image}
                                alt=""
                                style={{
                                  width: "66px",
                                  height: "60px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                  background: "#171717",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "66px",
                                  height: "60px",
                                  background: "#171717",
                                  display: "grid",
                                  placeItems: "center",
                                  color: "#777777",
                                }}
                              >
                                No image
                              </div>
                            )}
                            <div>
                              <strong style={{ display: "block", marginBottom: "6px" }}>
                                {product.name}
                              </strong>
                              {product.badge && (
                                <span style={{ color: "#999999", fontSize: "11px" }}>
                                  {product.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: "14px", borderBottom: "1px solid #252525" }}>
                          <strong>{money(product.price)}</strong>
                          {product.old_price !== null &&
                            Number(product.old_price) > Number(product.price) && (
                              <span
                                style={{
                                  display: "block",
                                  marginTop: "5px",
                                  color: "#999999",
                                  textDecoration: "line-through",
                                  fontSize: "11px",
                                }}
                              >
                                {money(product.old_price)}
                              </span>
                            )}
                        </td>

                        <td style={{ padding: "14px", borderBottom: "1px solid #252525" }}>
                          {product.stock_quantity}
                        </td>

                        <td style={{ padding: "14px", borderBottom: "1px solid #252525" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "6px 9px",
                              border: "1px solid #444444",
                              borderRadius: "20px",
                              color: product.is_published ? "#ffffff" : "#999999",
                              fontSize: "11px",
                            }}
                          >
                            {product.is_published ? "Published" : "Draft"}
                          </span>
                        </td>

                        <td style={{ padding: "14px", borderBottom: "1px solid #252525" }}>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <button
                              type="button"
                              style={secondaryButtonStyle}
                              onClick={() => startEditing(product)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              style={secondaryButtonStyle}
                              disabled={busyId === product.id}
                              onClick={() => void togglePublished(product)}
                            >
                              {busyId === product.id
                                ? "Working..."
                                : product.is_published
                                  ? "Unpublish"
                                  : "Publish"}
                            </button>

                            <button
                              type="button"
                              style={{
                                ...secondaryButtonStyle,
                                color: "#ffb5b5",
                                borderColor: "#743333",
                              }}
                              disabled={busyId === product.id}
                              onClick={() => void deleteProduct(product)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p
          style={{
            color: "#777777",
            fontSize: "11px",
            lineHeight: 1.7,
            marginTop: "18px",
          }}
        >
          Product changes are saved to Supabase. Only published products are
          intended to appear in the public catalogue. Image files already
          uploaded to storage are not automatically removed when a product is
          deleted.
        </p>
      </div>
    </main>
  );
}
