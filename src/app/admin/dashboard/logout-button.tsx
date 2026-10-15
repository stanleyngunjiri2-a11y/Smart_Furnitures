"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Admin logout failed:", error);
      setLoading(false);
      return;
    }

    window.location.assign("/admin/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      style={{
        padding: "10px 15px",
        background: "transparent",
        color: "#ffffff",
        border: "1px solid #333333",
        borderRadius: "5px",
        cursor: loading ? "wait" : "pointer",
      }}
    >
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}
