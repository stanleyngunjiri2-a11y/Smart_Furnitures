"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Armchair,
  Tags,
  MessageSquare,
  Store,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Clock3,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  {
    label: "OVERVIEW",
    items: [
      {
        name: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
        active: true,
      },
    ],
  },
  {
    label: "STORE MANAGEMENT",
    items: [
      {
        name: "Products",
        href: "/admin/products",
        icon: Armchair,
        active: true,
      },
      {
        name: "Categories",
        href: "/admin/categories",
        icon: Tags,
        active: true,
      },
      {
        name: "Enquiries",
        href: "/admin/enquiries",
        icon: MessageSquare,
        active: true,
      },
    ],
  },
];

const comingSoon = [
  { name: "Orders", icon: Store },
  { name: "Customers", icon: Armchair },
  { name: "Analytics", icon: LayoutDashboard },
];

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Keep the login page independent of the admin sidebar.
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setLoggingOut(false);
      window.alert("Unable to sign out. Please try again.");
      return;
    }

    router.replace("/admin/login");
    router.refresh();
  }

  const sidebar = (
    <aside
      style={{
        width: "258px",
        minWidth: "258px",
        height: "100dvh",
        background: "#0a0a0a",
        borderRight: "1px solid #242424",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: "27px 22px 25px",
          borderBottom: "1px solid #242424",
        }}
      >
        <Link
          href="/admin/dashboard"
          onClick={() => setMobileOpen(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
            color: "#fff",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              background: "#fff",
              color: "#050505",
              borderRadius: "8px",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Armchair size={24} strokeWidth={1.8} />
          </div>

          <div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 800,
                letterSpacing: "1.4px",
              }}
            >
              SMART
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 800,
                letterSpacing: "1.4px",
                marginTop: "3px",
              }}
            >
              FURNITURES
            </div>
            <div
              style={{
                fontSize: "9px",
                color: "#777",
                letterSpacing: "1.5px",
                marginTop: "5px",
              }}
            >
              ADMINISTRATION
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div
        style={{
          padding: "24px 13px",
          flex: 1,
          overflowY: "auto",
        }}
      >
        {navigation.map((group) => (
          <div key={group.label} style={{ marginBottom: "28px" }}>
            <p
              style={{
                color: "#666",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "1.5px",
                padding: "0 12px",
                margin: "0 0 12px",
              }}
            >
              {group.label}
            </p>

            <div style={{ display: "grid", gap: "5px" }}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const selected =
                  pathname === item.href ||
                  (item.href !== "/admin/dashboard" &&
                    pathname.startsWith(item.href + "/"));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={selected ? "page" : undefined}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "12px",
                      minHeight: "44px",
                      boxSizing: "border-box",
                      borderRadius: "7px",
                      textDecoration: "none",
                      color: selected ? "#fff" : "#999",
                      background: selected ? "#202020" : "transparent",
                      border: selected
                        ? "1px solid #363636"
                        : "1px solid transparent",
                      fontSize: "13px",
                      fontWeight: selected ? 600 : 400,
                      transition: "background 150ms ease",
                    }}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                    <span style={{ flex: 1 }}>{item.name}</span>

                    {selected && (
                      <ChevronRight size={15} color="#fff" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div>
          <p
            style={{
              color: "#666",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "1.5px",
              padding: "0 12px",
              margin: "0 0 12px",
            }}
          >
            MORE FEATURES
          </p>

          <div style={{ display: "grid", gap: "5px" }}>
            {comingSoon.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.name}
                  title={`${item.name} management is not implemented yet`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px",
                    minHeight: "44px",
                    boxSizing: "border-box",
                    color: "#555",
                    fontSize: "13px",
                    cursor: "not-allowed",
                  }}
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span style={{ flex: 1 }}>{item.name}</span>
                  <Clock3 size={13} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar footer */}
      <div
        style={{
          padding: "15px 13px",
          borderTop: "1px solid #242424",
          display: "grid",
          gap: "7px",
        }}
      >
        <Link
          href="/"
          target="_blank"
          onClick={() => setMobileOpen(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px",
            color: "#aaa",
            textDecoration: "none",
            fontSize: "13px",
          }}
        >
          <Store size={18} />
          View Storefront
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px",
            width: "100%",
            background: "transparent",
            border: "1px solid transparent",
            borderRadius: "7px",
            color: "#999",
            fontSize: "13px",
            textAlign: "left",
            cursor: loggingOut ? "wait" : "pointer",
            opacity: loggingOut ? 0.6 : 1,
          }}
        >
          <LogOut size={18} />
          {loggingOut ? "Signing out..." : "Sign Out"}
        </button>

        <div
          style={{
            padding: "12px",
            borderRadius: "7px",
            background: "#111",
            marginTop: "5px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "11px",
              color: "#bbb",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                background: "#72c98b",
                borderRadius: "50%",
              }}
            />
            Administrator area
          </div>
          <p
            style={{
              color: "#666",
              fontSize: "10px",
              margin: "7px 0 0",
            }}
          >
            Smart Furnitures
          </p>
        </div>
      </div>
    </aside>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#fff",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      {/* Desktop sidebar */}
      <div
        className="sf-admin-desktop-sidebar"
        style={{
          position: "fixed",
          inset: "0 auto 0 0",
          zIndex: 40,
        }}
      >
        {sidebar}
      </div>

      {/* Mobile header */}
      <header
        className="sf-admin-mobile-header"
        style={{
          display: "none",
          position: "sticky",
          top: 0,
          zIndex: 30,
          alignItems: "center",
          justifyContent: "space-between",
          gap: "15px",
          padding: "14px 18px",
          background: "#0a0a0a",
          borderBottom: "1px solid #242424",
        }}
      >
        <Link
          href="/admin/dashboard"
          style={{
            color: "#fff",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: 800,
            letterSpacing: "1px",
          }}
        >
          SMART FURNITURES
        </Link>

        <button
          type="button"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: "grid",
            placeItems: "center",
            width: "42px",
            height: "42px",
            background: "#171717",
            border: "1px solid #333",
            borderRadius: "7px",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      {/* Mobile slide-out sidebar */}
      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 48,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.7)",
              border: "none",
              cursor: "pointer",
            }}
          />

          <div
            style={{
              position: "fixed",
              inset: "0 auto 0 0",
              zIndex: 49,
              maxWidth: "85vw",
            }}
          >
            {sidebar}
          </div>
        </>
      )}

      {/* Main page content */}
      <div
        className="sf-admin-main"
        style={{
          marginLeft: "258px",
          minHeight: "100vh",
          minWidth: 0,
        }}
      >
        {children}
      </div>

      <style jsx global>{`
        @media (max-width: 850px) {
          .sf-admin-desktop-sidebar {
            display: none !important;
          }

          .sf-admin-mobile-header {
            display: flex !important;
          }

          .sf-admin-main {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
