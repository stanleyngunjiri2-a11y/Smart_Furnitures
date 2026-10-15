"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.user) {
        setMessage(error?.message ?? "Unable to sign in.");
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut();
        setMessage(
          "This account does not have verified administrator access."
        );
        return;
      }

      window.location.assign("/admin/dashboard");
    } catch (error) {
      console.error("Admin login failed:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "40px",
          background: "#101010",
          border: "1px solid #333333",
          borderRadius: "12px",
          boxSizing: "border-box",
        }}
      >
        <p
          style={{
            color: "#ffffff",
            letterSpacing: "4px",
            fontSize: "11px",
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          SMART FURNITURES
        </p>

        <h1
          style={{
            fontSize: "30px",
            textAlign: "center",
            margin: "20px 0 10px",
          }}
        >
          Admin Login
        </h1>

        <p
          style={{
            color: "#999999",
            textAlign: "center",
            fontSize: "14px",
            lineHeight: 1.7,
            marginBottom: "30px",
          }}
        >
          Sign in with your authorized administrator account.
        </p>

        <form onSubmit={handleLogin}>
          <label
            htmlFor="admin-email"
            style={{ display: "block", fontSize: "13px", marginBottom: "8px" }}
          >
            Email address
          </label>

          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "20px",
              border: "1px solid #393630",
              borderRadius: "6px",
              background: "#050505",
              color: "#ffffff",
              boxSizing: "border-box",
              outlineColor: "#ffffff",
            }}
          />

          <label
            htmlFor="admin-password"
            style={{ display: "block", fontSize: "13px", marginBottom: "8px" }}
          >
            Password
          </label>

          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            style={{
              width: "100%",
              padding: "14px",
              marginBottom: "20px",
              border: "1px solid #393630",
              borderRadius: "6px",
              background: "#050505",
              color: "#ffffff",
              boxSizing: "border-box",
              outlineColor: "#ffffff",
            }}
          />

          {message && (
            <p
              role="alert"
              style={{
                color: "#ff9999",
                fontSize: "13px",
                lineHeight: 1.6,
                marginBottom: "18px",
              }}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              background: loading ? "#c5c5c5" : "#ffffff",
              color: "#050505",
              border: "none",
              borderRadius: "6px",
              fontWeight: 700,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "VERIFYING ACCESS..." : "SIGN IN"}
          </button>
        </form>

        <a
          href="/"
          style={{
            display: "block",
            textAlign: "center",
            marginTop: "25px",
            color: "#999999",
            fontSize: "13px",
            textDecoration: "none",
          }}
        >
          ← Return to storefront
        </a>
      </section>
    </main>
  );
}
