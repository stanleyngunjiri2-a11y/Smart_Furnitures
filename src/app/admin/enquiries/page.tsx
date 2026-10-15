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
  enquiry_type?: string | null;
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
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const statuses = ["new", "contacted", "resolved", "closed"];

function formatEnquiryType(item: Enquiry) {
  if (item.enquiry_type === "custom_furniture") {
    return "Custom Furniture Request";
  }

  if (item.product_id) {
    return "Product Enquiry";
  }

  return "General Enquiry";
}

function whatsappLink(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  const normalized =
    digits.startsWith("0") && digits.length === 10
      ? `254${digits.slice(1)}`
      : digits;

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export default function AdminEnquiriesPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      const { data: auth, error: authError } = await supabase.auth.getUser();

      if (authError || !auth.user) {
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

      if (productResult.error) {
        console.error("Could not load products:", productResult.error);
      } else {
        setProducts((productResult.data ?? []) as Product[]);
      }

      setLoading(false);
    }

    void initialize();

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
      setError(`Could not update enquiry status: ${updateError.message}`);
    } else {
      setEnquiries((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status } : item,
        ),
      );
    }

    setUpdatingId(null);
  }

  async function deleteEnquiry(enquiry: Enquiry) {
    const confirmed = window.confirm(
      `Delete the enquiry from ${enquiry.customer_name}? This cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(enquiry.id);
    setError("");

    const { error: deleteError } = await supabase
      .from("customer_enquiries")
      .delete()
      .eq("id", enquiry.id);

    if (deleteError) {
      setError(`Could not delete enquiry: ${deleteError.message}`);
      setDeletingId(null);
      return;
    }

    setEnquiries((current) =>
      current.filter((item) => item.id !== enquiry.id),
    );

    setDeletingId(null);
  }

  const productName = (id: string | null) =>
    products.find((product) => product.id === id)?.name ??
    (id ? "Product" : "No linked product");

  const term = search.trim().toLowerCase();

  const filtered = enquiries.filter((item) => {
    const matchesStatus = filter === "all" || item.status === filter;

    const searchableValues = [
      item.customer_name,
      item.phone,
      item.email ?? "",
      item.message,
      item.enquiry_type ?? "",
      formatEnquiryType(item),
      productName(item.product_id),
    ];

    const matchesSearch =
      !term ||
      searchableValues.some((value) =>
        value.toLowerCase().includes(term),
      );

    return matchesStatus && matchesSearch;
  });

  const newCount = enquiries.filter((item) => item.status === "new").length;

  const customCount = enquiries.filter(
    (item) => item.enquiry_type === "custom_furniture",
  ).length;

  const productEnquiryCount = enquiries.filter(
    (item) => item.product_id !== null,
  ).length;

  if (loading) {
    return (
      <main
        style={{
          background: "#050505",
          color: "#fff",
          minHeight: "100vh",
          padding: "40px",
          fontFamily: "Arial, sans-serif",
        }}
      >
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
          <p
            style={{
              color: "#999",
              fontSize: "12px",
              letterSpacing: "2px",
            }}
          >
            SMART FURNITURES / ADMIN
          </p>

          <h1 style={{ fontSize: "30px", margin: "8px 0" }}>
            Customer Enquiries
          </h1>

          <p style={{ color: "#999", fontSize: "14px" }}>
            Review customer messages, custom furniture requests, and follow-ups.
          </p>
        </div>

        <nav
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <Link href="/admin/dashboard" style={buttonStyle}>
            Dashboard
          </Link>
          <Link href="/admin/products" style={buttonStyle}>
            Products
          </Link>
          <Link href="/admin/categories" style={buttonStyle}>
            Categories
          </Link>
          <Link href="/" style={buttonStyle}>
            Storefront
          </Link>
        </nav>
      </header>

      {error && (
        <div
          role="alert"
          style={{
            padding: "14px",
            marginBottom: "20px",
            background: "#190c0c",
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
          ["Custom Requests", customCount],
          ["Product Enquiries", productEnquiryCount],
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
          placeholder="Search name, phone, email, type or message..."
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

        <button
          type="button"
          onClick={() => void loadEnquiries()}
          style={buttonStyle}
        >
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
            : "No enquiries match your search or status filter."}
        </div>
      ) : (
        <section style={{ display: "grid", gap: "14px" }}>
          {filtered.map((item) => {
            const isCustom = item.enquiry_type === "custom_furniture";

            const badgeStyle: React.CSSProperties = {
              display: "inline-block",
              padding: "6px 10px",
              marginBottom: "12px",
              borderRadius: "4px",
              border: `1px solid ${isCustom ? "#82652e" : "#444"}`,
              background: isCustom ? "#211a0d" : "#171717",
              color: isCustom ? "#e7c77e" : "#d0d0d0",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.5px",
            };

            const replyMessage = [
              `Hello ${item.customer_name},`,
              "",
              "Thank you for contacting Smart Furnitures.",
              "We are following up on your enquiry.",
              "",
              item.message,
            ].join("\n");

            return (
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
                    <span style={badgeStyle}>
                      {formatEnquiryType(item)}
                    </span>

                    <h2 style={{ fontSize: "19px", margin: "0 0 10px" }}>
                      {item.customer_name}
                    </h2>

                    <p
                      style={{
                        color: "#c5c5c5",
                        margin: "6px 0",
                        fontSize: "14px",
                      }}
                    >
                      Phone:{" "}
                      <a href={`tel:${item.phone}`} style={{ color: "#fff" }}>
                        {item.phone}
                      </a>
                    </p>

                    {item.email && (
                      <p
                        style={{
                          color: "#c5c5c5",
                          margin: "6px 0",
                          fontSize: "14px",
                          overflowWrap: "anywhere",
                        }}
                      >
                        Email:{" "}
                        <a
                          href={`mailto:${item.email}`}
                          style={{ color: "#fff" }}
                        >
                          {item.email}
                        </a>
                      </p>
                    )}

                    {item.product_id && (
                      <p
                        style={{
                          color: "#999",
                          fontSize: "13px",
                          margin: "10px 0",
                        }}
                      >
                        Product: {productName(item.product_id)}
                      </p>
                    )}

                    <p
                      style={{
                        color: "#c5c5c5",
                        fontSize: "14px",
                        lineHeight: 1.7,
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.message}
                    </p>

                    <p style={{ color: "#777", fontSize: "12px" }}>
                      Received: {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      minWidth: "170px",
                    }}
                  >
                    <label
                      style={{ fontSize: "12px", color: "#999" }}
                      htmlFor={`status-${item.id}`}
                    >
                      Enquiry status
                    </label>

                    <select
                      id={`status-${item.id}`}
                      aria-label={`Status for ${item.customer_name}`}
                      value={item.status}
                      disabled={updatingId === item.id}
                      onChange={(event) =>
                        void updateStatus(item.id, event.target.value)
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

                    <a
                      href={whatsappLink(item.phone, replyMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        ...buttonStyle,
                        background: "#123b25",
                        borderColor: "#236b42",
                      }}
                    >
                      Contact on WhatsApp
                    </a>

                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => void deleteEnquiry(item)}
                      style={{
                        ...buttonStyle,
                        color: "#ff9999",
                        borderColor: "#633333",
                        opacity: deletingId === item.id ? 0.6 : 1,
                        cursor:
                          deletingId === item.id ? "not-allowed" : "pointer",
                      }}
                    >
                      {deletingId === item.id
                        ? "Deleting..."
                        : "Delete Enquiry"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}