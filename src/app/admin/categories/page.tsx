"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  background: "#101010",
  border: "1px solid #333",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "14px",
  boxSizing: "border-box" as const,
};

const buttonStyle = {
  padding: "10px 16px",
  borderRadius: "6px",
  border: "1px solid #444",
  background: "#171717",
  color: "#fff",
  cursor: "pointer",
  fontSize: "13px",
};

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.replace("/admin/login");
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      if (mounted) {
        await loadCategories();
      }
    }

    async function loadCategories() {
      setError("");

      const { data, error: queryError } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (!mounted) return;

      if (queryError) {
        setError(queryError.message);
      } else {
        setCategories((data ?? []) as Category[]);
      }

      setLoading(false);
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [router]);

  function resetForm() {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setIsActive(true);
  }

  function startEditing(category: Category) {
    setEditingId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description ?? "");
    setIsActive(category.is_active);
    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanSlug = makeSlug(slug || cleanName);

    if (!cleanName || !cleanSlug) {
      setError("Enter a valid category name.");
      return;
    }

    setSaving(true);

    const payload = {
      name: cleanName,
      slug: cleanSlug,
      description: description.trim() || null,
      is_active: isActive,
    };

    const result = editingId
      ? await supabase
          .from("categories")
          .update(payload)
          .eq("id", editingId)
          .select("*")
          .single()
      : await supabase
          .from("categories")
          .insert(payload)
          .select("*")
          .single();

    setSaving(false);

    if (result.error) {
      setError(
        result.error.code === "23505"
          ? "A category with this name or URL slug already exists."
          : result.error.message
      );
      return;
    }

    setSuccess(editingId ? "Category updated successfully." : "Category created successfully.");
    resetForm();

    const { data, error: reloadError } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (reloadError) {
      setError(reloadError.message);
    } else {
      setCategories((data ?? []) as Category[]);
    }
  }

  async function toggleCategory(category: Category) {
    setError("");
    setSuccess("");

    const { error: updateError } = await supabase
      .from("categories")
      .update({ is_active: !category.is_active })
      .eq("id", category.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setCategories((current) =>
      current.map((item) =>
        item.id === category.id
          ? { ...item, is_active: !category.is_active }
          : item
      )
    );

    setSuccess(
      category.is_active
        ? "Category deactivated."
        : "Category activated."
    );
  }

  async function deleteCategory(category: Category) {
    const confirmed = window.confirm(
      `Delete "${category.name}"? Products may reference this category, so deletion could be blocked.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (deleteError) {
      setError(
        "Could not delete this category. It may contain products. Deactivate it instead. Details: " +
          deleteError.message
      );
      return;
    }

    setCategories((current) =>
      current.filter((item) => item.id !== category.id)
    );

    if (editingId === category.id) resetForm();

    setSuccess("Category deleted successfully.");
  }

  const activeCount = categories.filter((item) => item.is_active).length;

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "#050505", color: "#fff", padding: "40px" }}>
        Checking administrator access...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#fff",
        padding: "32px 5%",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          borderBottom: "1px solid #292929",
          paddingBottom: "24px",
          marginBottom: "32px",
        }}
      >
        <div>
          <p style={{ color: "#999", fontSize: "12px", letterSpacing: "2px" }}>
            SMART FURNITURES / ADMIN
          </p>
          <h1 style={{ fontSize: "30px", margin: "8px 0" }}>
            Category Management
          </h1>
          <p style={{ color: "#999", fontSize: "14px" }}>
            Organize the categories displayed in your store.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/admin/dashboard" style={{ ...buttonStyle, textDecoration: "none" }}>
            Dashboard
          </Link>
          <Link href="/admin/products" style={{ ...buttonStyle, textDecoration: "none" }}>
            Products
          </Link>
          <Link href="/" style={{ ...buttonStyle, textDecoration: "none" }}>
            View Store
          </Link>
        </div>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {[
          ["Total Categories", categories.length],
          ["Active Categories", activeCount],
          ["Inactive Categories", categories.length - activeCount],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            style={{
              background: "#101010",
              border: "1px solid #292929",
              borderRadius: "8px",
              padding: "22px",
            }}
          >
            <p style={{ color: "#999", fontSize: "13px" }}>{label}</p>
            <strong style={{ fontSize: "28px" }}>{value}</strong>
          </div>
        ))}
      </section>

      <section
        style={{
          background: "#101010",
          border: "1px solid #292929",
          borderRadius: "8px",
          padding: "24px",
          marginBottom: "32px",
        }}
      >
        <h2 style={{ fontSize: "20px", marginTop: 0 }}>
          {editingId ? "Edit Category" : "Add New Category"}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
          <div>
            <label htmlFor="category-name" style={{ display: "block", marginBottom: "8px", fontSize: "13px" }}>
              Category Name *
            </label>
            <input
              id="category-name"
              style={inputStyle}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (!editingId) setSlug(makeSlug(event.target.value));
              }}
              placeholder="e.g. Sofas"
              maxLength={80}
              required
            />
          </div>

          <div>
            <label htmlFor="category-slug" style={{ display: "block", marginBottom: "8px", fontSize: "13px" }}>
              URL Slug *
            </label>
            <input
              id="category-slug"
              style={inputStyle}
              value={slug}
              onChange={(event) => setSlug(makeSlug(event.target.value))}
              placeholder="e.g. sofas"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label htmlFor="category-description" style={{ display: "block", marginBottom: "8px", fontSize: "13px" }}>
              Description
            </label>
            <textarea
              id="category-description"
              style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe this furniture category..."
              maxLength={500}
            />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            Active — available for use in the store
          </label>

          {error && (
            <p role="alert" style={{ color: "#ff7777", fontSize: "14px", overflowWrap: "anywhere" }}>
              {error}
            </p>
          )}

          {success && (
            <p role="status" style={{ color: "#9be7a5", fontSize: "14px" }}>
              {success}
            </p>
          )}

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button type="submit" disabled={saving} style={{ ...buttonStyle, background: "#fff", color: "#050505", border: "1px solid #fff", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving..." : editingId ? "Save Changes" : "Create Category"}
            </button>

            {editingId && (
              <button type="button" onClick={resetForm} style={buttonStyle}>
                Cancel Editing
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <h2 style={{ fontSize: "22px", marginBottom: "16px" }}>
          All Categories
        </h2>

        {categories.length === 0 ? (
          <div style={{ border: "1px solid #292929", padding: "30px", borderRadius: "8px", color: "#999" }}>
            No categories found. Create your first category above.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {categories.map((category) => (
              <article
                key={category.id}
                style={{
                  background: "#101010",
                  border: "1px solid #292929",
                  borderRadius: "8px",
                  padding: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: 0, flex: "1 1 220px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <h3 style={{ margin: 0, fontSize: "17px" }}>{category.name}</h3>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "5px 8px",
                        borderRadius: "4px",
                        background: category.is_active ? "#18331f" : "#292929",
                        color: category.is_active ? "#9be7a5" : "#aaa",
                      }}
                    >
                      {category.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                  <p style={{ color: "#999", fontSize: "13px", margin: "8px 0" }}>
                    /{category.slug}
                  </p>
                  {category.description && (
                    <p style={{ color: "#c5c5c5", fontSize: "13px", margin: 0, overflowWrap: "anywhere" }}>
                      {category.description}
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button type="button" onClick={() => startEditing(category)} style={buttonStyle}>
                    Edit
                  </button>
                  <button type="button" onClick={() => toggleCategory(category)} style={buttonStyle}>
                    {category.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCategory(category)}
                    style={{ ...buttonStyle, color: "#ff8888", borderColor: "#633333" }}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
