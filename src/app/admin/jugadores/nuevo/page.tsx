"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useRouter } from "next/navigation";

export default function NuevoJugadorPage() {
  const { loading: authLoading } = useRequireAuth("admin");
  const router = useRouter();

  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [mainPosition, setMainPosition] = useState("defensa");
  const [loading, setLoading] = useState(false);

  async function createPlayer() {
    setLoading(true);

    const { error } = await supabase
      .from("players")
      .insert({
        name,
        nickname,
        email,
        main_position: mainPosition,
        general_rating: 5,
        defense_rating: 5,
        midfield_rating: 5,
        attack_rating: 5,
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/admin/jugadores");
    router.refresh();
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 text-lg">Cargando...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <a href="/admin/jugadores" className="text-sm text-green-400 hover:text-green-300">
        Volver a jugadores
      </a>

      <h1 className="mt-8 text-3xl font-bold">Nuevo jugador</h1>

      <div className="mt-8 max-w-xl space-y-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre"
          className="w-full rounded-xl bg-slate-900 px-4 py-3"
        />
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Apodo"
          className="w-full rounded-xl bg-slate-900 px-4 py-3"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-xl bg-slate-900 px-4 py-3"
        />
        <select
          value={mainPosition}
          onChange={(e) => setMainPosition(e.target.value)}
          className="w-full rounded-xl bg-slate-900 px-4 py-3"
        >
          <option value="defensa">Defensa</option>
          <option value="mediocampo">Mediocampo</option>
          <option value="delantero">Delantero</option>
        </select>

        <button
          onClick={createPlayer}
          disabled={loading}
          className="rounded-xl bg-green-500 px-5 py-3 font-semibold text-slate-950"
        >
          {loading ? "Guardando..." : "Crear jugador"}
        </button>
      </div>
    </main>
  );
}