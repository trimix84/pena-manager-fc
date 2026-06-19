"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Role = "admin" | "player" | null;

export function useRequireAuth(requiredRole?: "admin") {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>(null);

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const { data: player } = await supabase
        .from("players")
        .select("role")
        .eq("email", session.user.email)
        .single();

      const userRole = player?.role ?? "player";
      setRole(userRole);

      if (requiredRole === "admin" && userRole !== "admin") {
        router.replace("/");
        return;
      }

      setLoading(false);
    }

    check();
  }, []);

  return { loading };
}