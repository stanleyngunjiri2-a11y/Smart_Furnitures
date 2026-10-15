import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Armchair,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  Eye,
  Layers3,
  MessageSquare,
  PackagePlus,
  ShoppingBag,
  Tags,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type RecentProduct = {
  id: string;
  name: string;
  price: number | string;
  image_url: string | null;
  image_urls: string[] | null;
  stock_quantity: number | null;
  is_published: boolean;
  created_at: string;
  categories: { name: string } | { name: string }[] | null;
};

const cardStyle = {
  background: "#101010",
  border: "1px solid #292929",
  borderRadius: "12px",
};

const buttonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "9px",
  padding: "12px 16px",
  borderRadius: "6px",
  textDecoration: "none",
  fontSize: "12px",
  fontWeight: 700,
};

function money(value: number | string) {
  return `KSh ${Number(value).toLocaleString("en-KE", {
    maximumFractionDigits: 2,
  })}`;
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError || !admin) {
    redirect("/admin/login");
  }

  const [
    totalProducts,
    publishedProducts,
    draftProducts,
    outOfStockProducts,
    totalCategories,
    totalEnquiries,
    recentProductsResult,
    newEnquiriesResult,
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_published", false),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .lte("stock_quantity", 0),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase
      .from("customer_enquiries")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("products")
      .select(
        "id,name,price,image_url,image_urls,stock_quantity,is_published,created_at,categories(name)"
      )
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("customer_enquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  const hasStatisticsError = [
    totalProducts,
    publishedProducts,
    draftProducts,
    outOfStockProducts,
    totalCategories,
    totalEnquiries,
    newEnquiriesResult,
  ].some((result) => result.error);

  const recentProducts = (recentProductsResult.data ??
    []) as unknown as RecentProduct[];

  const statistics = [
    {
      label: "Total products",
      value: totalProducts.count ?? 0,
      note: "Products in your catalogue",
      icon: ShoppingBag,
      href: "/admin/products",
    },
    {
      label: "Published products",
      value: publishedProducts.count ?? 0,
      note: "Visible to your customers",
      icon: CheckCircle2,
      href: "/admin/products",
    },
    {
      label: "Draft products",
      value: draftProducts.count ?? 0,
      note: "Hidden from the storefront",
      icon: ClipboardList,
      href: "/admin/products",
    },
    {
      label: "Out of stock",
      value: outOfStockProducts.count ?? 0,
      note: "Products needing restocking",
      icon: Boxes,
      href: "/admin/products",
    },
    {
      label: "Categories",
      value: totalCategories.count ?? 0,
      note: "Organised furniture collections",
      icon: Tags,
      href: "/admin/categories",
    },
    {
      label: "Customer enquiries",
      value: totalEnquiries.count ?? 0,
      note: `${newEnquiriesResult.count ?? 0} new enquiries`,
      icon: MessageSquare,
      href: "/admin/enquiries",
    },
  ];

  const quickActions = [
    {
      title: "Add a product",
      description: "Add furniture, prices and images.",
      href: "/admin/products",
      label: "Manage products",
      icon: PackagePlus,
    },
    {
      title: "Manage categories",
      description: "Organise your furniture collections.",
      href: "/admin/categories",
      label: "View categories",
      icon: Layers3,
    },
    {
      title: "Customer enquiries",
      description: "Review messages from potential buyers.",
      href: "/admin/enquiries",
      label: "View enquiries",
      icon: MessageSquare,
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#fff",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          padding: "32px clamp(18px, 4vw, 48px) 60px",
          maxWidth: "1600px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: "36px",
          }}
        >
          <div>
            <p
              style={{
                color: "#999",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "2.5px",
                margin: "0 0 12px",
              }}
            >
              SMART FURNITURES / ADMINISTRATION
            </p>

            <h1
              style={{
                fontSize: "clamp(28px, 4vw, 40px)",
                letterSpacing: "-1.3px",
                margin: 0,
                fontWeight: 700,
              }}
            >
              Dashboard
            </h1>

            <p
              style={{
                color: "#999",
                fontSize: "13px",
                lineHeight: 1.7,
                margin: "12px 0 0",
              }}
            >
              Welcome back, {user.email}. Here is your store overview.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <Link
              href="/"
              target="_blank"
              style={{
                ...buttonStyle,
                color: "#fff",
                background: "#101010",
                border: "1px solid #333",
              }}
            >
              <Eye size={15} />
              View storefront
              <ArrowUpRight size={14} />
            </Link>

            <Link
              href="/admin/products"
              style={{
                ...buttonStyle,
                color: "#050505",
                background: "#fff",
                border: "1px solid #fff",
              }}
            >
              <PackagePlus size={15} />
              Manage products
            </Link>
          </div>
        </header>

        <section
          style={{
            ...cardStyle,
            padding: "24px",
            marginBottom: "30px",
            background:
              "linear-gradient(115deg, #151515 0%, #0b0b0b 75%)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                border: "1px solid #333",
                borderRadius: "10px",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <Armchair size={25} strokeWidth={1.4} />
            </div>

            <div>
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  margin: "0 0 7px",
                }}
              >
                Your store at a glance
              </p>
              <p style={{ color: "#999", fontSize: "12px", margin: 0 }}>
                Manage your catalogue and keep track of incoming enquiries.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "11px",
              color: "#c5c5c5",
              padding: "10px 13px",
              border: "1px solid #333",
              borderRadius: "30px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                background: "#fff",
                borderRadius: "50%",
              }}
            />
            Administrator verified
          </div>
        </section>

        <section aria-labelledby="statistics-heading">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            <div>
              <h2
                id="statistics-heading"
                style={{ fontSize: "18px", margin: 0 }}
              >
                Store overview
              </h2>
              <p
                style={{
                  fontSize: "12px",
                  color: "#777",
                  margin: "7px 0 0",
                }}
              >
                Live figures from your database
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 205px), 1fr))",
              gap: "14px",
            }}
          >
            {statistics.map((stat) => {
              const Icon = stat.icon;

              return (
                <Link
                  href={stat.href}
                  key={stat.label}
                  style={{
                    ...cardStyle,
                    padding: "21px",
                    textDecoration: "none",
                    color: "#fff",
                    display: "block",
                    transition: "border-color 160ms ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                    }}
                  >
                    <span style={{ color: "#aaa", fontSize: "12px" }}>
                      {stat.label}
                    </span>
                    <Icon size={18} color="#c5c5c5" strokeWidth={1.5} />
                  </div>

                  <p
                    style={{
                      fontSize: "35px",
                      fontWeight: 700,
                      letterSpacing: "-1px",
                      margin: "22px 0 10px",
                    }}
                  >
                    {stat.value.toLocaleString("en-KE")}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                    }}
                  >
                    <span style={{ color: "#777", fontSize: "11px" }}>
                      {stat.note}
                    </span>
                    <ArrowUpRight size={14} color="#888" />
                  </div>
                </Link>
              );
            })}
          </div>

          {hasStatisticsError && (
            <p
              role="status"
              style={{
                color: "#ffaaaa",
                fontSize: "12px",
                lineHeight: 1.7,
                marginTop: "15px",
              }}
            >
              Some statistics could not be loaded. Check the relevant Supabase
              table permissions and administrator RLS policies.
            </p>
          )}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 350px), 1fr))",
            gap: "22px",
            marginTop: "38px",
          }}
        >
          <div style={{ ...cardStyle, padding: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                marginBottom: "22px",
              }}
            >
              <div>
                <h2 style={{ fontSize: "17px", margin: 0 }}>
                  Recent products
                </h2>
                <p
                  style={{
                    color: "#777",
                    fontSize: "11px",
                    margin: "7px 0 0",
                  }}
                >
                  Your latest catalogue additions
                </p>
              </div>

              <Link
                href="/admin/products"
                aria-label="View all products"
                style={{ color: "#ccc", display: "flex" }}
              >
                <ArrowUpRight size={19} />
              </Link>
            </div>

            {recentProductsResult.error ? (
              <p style={{ color: "#ffaaaa", fontSize: "12px", lineHeight: 1.7 }}>
                Products could not be loaded. Check your database permissions.
              </p>
            ) : recentProducts.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "28px 12px",
                  border: "1px dashed #333",
                  borderRadius: "8px",
                }}
              >
                <ShoppingBag
                  size={28}
                  color="#777"
                  style={{ margin: "0 auto 12px" }}
                />
                <p style={{ fontSize: "13px", margin: "0 0 8px" }}>
                  No products yet
                </p>
                <p style={{ color: "#777", fontSize: "11px" }}>
                  Your new products will appear here.
                </p>
              </div>
            ) : (
              <div>
                {recentProducts.map((product, index) => {
                  const relation = product.categories;
                  const category = Array.isArray(relation)
                    ? relation[0]?.name
                    : relation?.name;
                  const image =
                    product.image_url || product.image_urls?.[0] || "";

                  return (
                    <div
                      key={product.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "13px",
                        padding: "13px 0",
                        borderBottom:
                          index === recentProducts.length - 1
                            ? "none"
                            : "1px solid #252525",
                      }}
                    >
                      <div
                        style={{
                          width: "58px",
                          height: "58px",
                          flexShrink: 0,
                          borderRadius: "7px",
                          background: image
                            ? `#171717 url("${image.replace(/["\\]/g, "")}") center / cover no-repeat`
                            : "#1b1b1b",
                          border: "1px solid #292929",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        {!image && <Armchair size={22} color="#777" />}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            margin: "0 0 6px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {product.name}
                        </p>
                        <p
                          style={{
                            color: "#888",
                            fontSize: "10px",
                            margin: "0 0 7px",
                          }}
                        >
                          {category || "Furniture"} ·{" "}
                          {dateLabel(product.created_at)}
                        </p>
                        <p
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            margin: 0,
                          }}
                        >
                          {money(product.price)}
                        </p>
                      </div>

                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "9px",
                            fontWeight: 700,
                            padding: "5px 7px",
                            borderRadius: "4px",
                            border: "1px solid #383838",
                            color: product.is_published ? "#fff" : "#999",
                          }}
                        >
                          {product.is_published ? "PUBLISHED" : "DRAFT"}
                        </span>
                        <p
                          style={{
                            fontSize: "10px",
                            color:
                              Number(product.stock_quantity ?? 0) <= 0
                                ? "#ffaaaa"
                                : "#888",
                            margin: "7px 0 0",
                          }}
                        >
                          Stock: {product.stock_quantity ?? 0}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Link
              href="/admin/products"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                padding: "12px",
                marginTop: "14px",
                border: "1px solid #333",
                borderRadius: "5px",
                color: "#ccc",
                textDecoration: "none",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              VIEW ALL PRODUCTS <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ ...cardStyle, padding: "24px" }}>
            <h2 style={{ fontSize: "17px", margin: "0 0 7px" }}>
              Quick actions
            </h2>
            <p
              style={{
                color: "#777",
                fontSize: "11px",
                margin: "0 0 22px",
              }}
            >
              Common store management tasks
            </p>

            <div style={{ display: "grid", gap: "12px" }}>
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "17px",
                      background: "#080808",
                      border: "1px solid #292929",
                      borderRadius: "8px",
                      color: "#fff",
                      textDecoration: "none",
                    }}
                  >
                    <div
                      style={{
                        width: "39px",
                        height: "39px",
                        display: "grid",
                        placeItems: "center",
                        border: "1px solid #333",
                        borderRadius: "7px",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={19} strokeWidth={1.5} />
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          margin: "0 0 6px",
                        }}
                      >
                        {action.title}
                      </p>
                      <p
                        style={{
                          color: "#888",
                          fontSize: "11px",
                          lineHeight: 1.6,
                          margin: 0,
                        }}
                      >
                        {action.description}
                      </p>
                    </div>

                    <ArrowUpRight size={16} color="#999" />
                  </Link>
                );
              })}
            </div>

            <Link
              href="/admin/enquiries"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "17px",
                marginTop: "22px",
                border: "1px solid #292929",
                borderRadius: "8px",
                textDecoration: "none",
                color: "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                <MessageSquare size={19} color="#bbb" />
                <div>
                  <p style={{ fontSize: "12px", margin: "0 0 5px" }}>
                    New customer enquiries
                  </p>
                  <p style={{ color: "#888", fontSize: "11px", margin: 0 }}>
                    {newEnquiriesResult.count ?? 0} awaiting attention
                  </p>
                </div>
              </div>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        <section style={{ marginTop: "26px" }}>
          <div
            style={{
              ...cardStyle,
              padding: "20px 23px",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "39px",
                height: "39px",
                display: "grid",
                placeItems: "center",
                border: "1px solid #333",
                borderRadius: "8px",
                flexShrink: 0,
              }}
            >
              {Number(outOfStockProducts.count ?? 0) > 0 ? (
                <CircleAlert size={19} />
              ) : (
                <CheckCircle2 size={19} />
              )}
            </div>

            <div style={{ flex: 1, minWidth: "180px" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, margin: "0 0 6px" }}>
                Inventory status
              </p>
              <p style={{ fontSize: "11px", color: "#888", margin: 0 }}>
                {Number(outOfStockProducts.count ?? 0) > 0
                  ? `${outOfStockProducts.count} product(s) currently have zero or negative stock. Review your inventory.`
                  : "No out-of-stock products were found in your inventory."}
              </p>
            </div>

            <Link
              href="/admin/products"
              style={{
                ...buttonStyle,
                background: "#fff",
                color: "#050505",
                border: "1px solid #fff",
              }}
            >
              Review inventory <ArrowUpRight size={14} />
            </Link>
          </div>
        </section>

        <footer
          style={{
            marginTop: "38px",
            paddingTop: "22px",
            borderTop: "1px solid #242424",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            color: "#666",
            fontSize: "10px",
          }}
        >
          <span>SMART FURNITURES · STORE ADMINISTRATION</span>
          <span>Signed in as {user.email}</span>
        </footer>
      </div>
    </main>
  );
}
