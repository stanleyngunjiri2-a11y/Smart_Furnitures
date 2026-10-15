"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Enquiry = {
  id: string;
  customer_name: string;
  phone: string;
  email: string | null;
  product_id: string | null;
  message: string;
  status: string;
  created_at: string;
};

type Product = {
  id: string;
  name: string;
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 14px",
  background: "#171717",
  color: "#fff",
  border: "1px solid #333",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
  textDecoration: "none",
};

const statuses = ["new", "contacted", "resolved", "closed"];

export default function AdminEnquiriesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadEnquiries = useCallback(async () => {
    const { data, error: queryError } = await supabase
      .from("customer_enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      return;
    }

    setEnquiries((data ?? []) as Enquiry[]);
    setError("");
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const { data: auth } = await supabase.auth.getUser();

      if (!auth.user) {
        router.replace("/admin/login");
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", auth.user.id)
        .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut();
        router.replace("/admin/login");
        return;
      }

      const [enquiryResult, productResult] = await Promise.all([
        supabase
          .from("customer_enquiries")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("products").select("id, name"),
      ]);

      if (!mounted) return;

      if (enquiryResult.error) {
        setError(enquiryResult.error.message);
      } else {
        setEnquiries((enquiryResult.data ?? []) as Enquiry[]);
      }

      if (!productResult.error) {
        setProducts((productResult.data ?? []) as Product[]);
      }

      setLoading(false);
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    setError("");

    const { error: updateError } = await supabase
      .from("customer_enquiries")
      .update({ status })
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setEnquiries((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status } : item
        )
      );
    }

    setUpdatingId(null);
  }

  async function deleteEnquiry(enquiry: Enquiry) {
    if (
      !window.confirm(
        `Delete the enquiry from ${enquiry.customer_name}? This cannot be undone.`
      )
    ) {
      return;
    }

    setError("");

    const { error: deleteError } = await supabase
      .from("customer_enquiries")
      .delete()
      .eq("id", enquiry.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setEnquiries((current) =>
      current.filter((item) => item.id !== enquiry.id)
    );
  }

  const productName = (id: string | null) =>
    products.find((product) => product.id === id)?.name ?? "General enquiry";

  const filtered = enquiries.filter((item) => {
    const matchesStatus = filter === "all" || item.status === filter;
    const term = search.toLowerCase();

    const matchesSearch = [
      item.customer_name,
      item.phone,
      item.email ?? "",
      item.message,
      productName(item.product_id),
    ].some((value) => value.toLowerCase().includes(term));

    return matchesStatus && matchesSearch;
  });

  const newCount = enquiries.filter((item) => item.status === "new").length;

  if (loading) {
    return (
      <main style={{ background: "#050505", color: "#fff", minHeight: "100vh", padding: "40px" }}>
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
          flexWrap: "wrap",
          gap: "16px",
          borderBottom: "1px solid #292929",
          paddingBottom: "24px",
          marginBottom: "28px",
        }}
      >
        <div>
          <p style={{ color: "#999", fontSize: "12px", letterSpacing: "2px" }}>
            SMART FURNITURES / ADMIN
          </p>
          <h1 style={{ fontSize: "30px", margin: "8px 0" }}>
            Customer Enquiries
          </h1>
          <p style={{ color: "#999", fontSize: "14px" }}>
            Review customer messages and track follow-ups.
          </p>
        </div>

        <nav style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Link href="/admin/dashboard" style={buttonStyle}>Dashboard</Link>
          <Link href="/admin/products" style={buttonStyle}>Products</Link>
          <Link href="/admin/categories" style={buttonStyle}>Categories</Link>
          <Link href="/" style={buttonStyle}>Storefront</Link>
        </nav>
      </header>

      {error && (
        <div
          role="alert"
          style={{
            padding: "14px",
            marginBottom: "20px",
            border: "1px solid #633333",
            borderRadius: "6px",
            color: "#ff9999",
            overflowWrap: "anywhere",
          }}
        >
          {error}
        </div>
      )}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        {[
          ["Total Enquiries", enquiries.length],
          ["New Enquiries", newCount],
          ["Other Enquiries", enquiries.length - newCount],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            style={{
              padding: "22px",
              background: "#101010",
              border: "1px solid #292929",
              borderRadius: "8px",
            }}
          >
            <p style={{ color: "#999", fontSize: "13px" }}>{label}</p>
            <strong style={{ fontSize: "28px" }}>{value}</strong>
          </div>
        ))}
      </section>

      <section
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "22px",
        }}
      >
        <input
          aria-label="Search enquiries"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, phone, email or message..."
          style={{
            flex: "1 1 260px",
            padding: "12px",
            background: "#101010",
            color: "#fff",
            border: "1px solid #333",
            borderRadius: "6px",
          }}
        />

        <select
          aria-label="Filter enquiries by status"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          style={{
            padding: "12px",
            background: "#101010",
            color: "#fff",
            border: "1px solid #333",
            borderRadius: "6px",
          }}
        >
          <option value="all">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>

        <button type="button" onClick={loadEnquiries} style={buttonStyle}>
          Refresh
        </button>
      </section>

      {filtered.length === 0 ? (
        <div
          style={{
            padding: "36px 24px",
            textAlign: "center",
            color: "#999",
            background: "#101010",
            border: "1px solid #292929",
            borderRadius: "8px",
          }}
        >
          {enquiries.length === 0
            ? "No customer enquiries yet."
            : "No enquiries match your search."}
        </div>
      ) : (
        <section style={{ display: "grid", gap: "14px" }}>
          {filtered.map((item) => (
            <article
              key={item.id}
              style={{
                padding: "22px",
                background: "#101010",
                border: "1px solid #292929",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1 1 250px", minWidth: 0 }}>
                  <h2 style={{ fontSize: "19px", margin: "0 0 10px" }}>
                    {item.customer_name}
                  </h2>

                  <p style={{ color: "#c5c5c5", margin: "6px 0", fontSize: "14px" }}>
                    Phone:{" "}
                    <a
                      href={`tel:${item.phone}`}
                      style={{ color: "#fff" }}
                    >
                      {item.phone}
                    </a>
                  </p>

                  {item.email && (
                    <p style={{ color: "#c5c5c5", margin: "6px 0", fontSize: "14px", overflowWrap: "anywhere" }}>
                      Email:{" "}
                      <a
                        href={`mailto:${item.email}`}
                        style={{ color: "#fff" }}
                      >
                        {item.email}
                      </a>
                    </p>
                  )}

                  <p style={{ color: "#999", fontSize: "13px", margin: "10px 0" }}>
                    Product: {productName(item.product_id)}
                  </p>

                  <p style={{ color: "#c5c5c5", fontSize: "14px", lineHeight: 1.7, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                    {item.message}
                  </p>

                  <p style={{ color: "#777", fontSize: "12px" }}>
                    Received: {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "150px" }}>
                  <label style={{ fontSize: "12px", color: "#999" }}>
                    Enquiry status
                  </label>

                  <select
                    aria-label={`Status for ${item.customer_name}`}
                    value={item.status}
                    disabled={updatingId === item.id}
                    onChange={(event) =>
                      updateStatus(item.id, event.target.value)
                    }
                    style={{
                      padding: "10px",
                      background: "#171717",
                      color: "#fff",
                      border: "1px solid #444",
                      borderRadius: "6px",
                    }}
                  >
                    {!statuses.includes(item.status) && (
                      <option value={item.status}>{item.status}</option>
                    )}
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>

                  {updatingId === item.id && (
                    <span style={{ color: "#999", fontSize: "12px" }}>
                      Saving status...
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteEnquiry(item)}
                    style={{ ...buttonStyle, color: "#ff9999", borderColor: "#633333" }}
                  >
                    Delete Enquiry
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
