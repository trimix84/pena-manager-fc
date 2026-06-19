"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { sendNotificationToAll } from "@/lib/notifications";

type Match = {
  id: string;
  match_date: string;
  location: string;
  team_a_score: number | null;
  team_b_score: number | null;
};

export default function ResultadosPage() {
  const { loading: authLoading } = useRequireAuth("admin");
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);

  useEffect(() => {
    if (!authLoading) loadMatch();
  }, [authLoading]);

  async function loadMatch() {
    const { data } = await supabase
      .from("matches")
      .select("*")
      .eq("status", "open")
      .single();

    if (data) {
      setMatch(data);
      setTeamAScore(data.team_a_score ?? 0);
      setTeamBScore(data.team_b_score ?? 0);
    }

    setLoading(false);
  }

  async function saveResult() {
    if (!match) return;

    const { error } = await supabase
      .from("matches")
      .update({
        team_a_score: teamAScore,
        team_b_score: teamBScore,
        status: "played",
      })
      .eq("id", match.id);

    if (error) {
      alert(error.message);
      return;
    }

    await sendNotificationToAll("result_published", {
      scoreA: teamAScore,
      scoreB: teamBScore,
    });

    alert("Resultado guardado");
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        Cargando...
      </main>
    );
  }

  if (!match) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <a href="/admin" className="text-sm text-green-400">
          Volver al panel
        </a>
        <p className="mt-6">No hay partido abierto.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <a href="/admin" className="text-sm text-green-400">
        Volver al panel
      </a>

      <h1 className="mt-6 text-4xl font-bold">Registrar resultado</h1>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="font-bold">{match.match_date}</p>
        <p className="text-slate-400">{match.location}</p>
      </div>

      <div className="mt-8 flex items-center gap-6">
        <input
          type="number"
          min="0"
          value={teamAScore}
          onChange={(e) => setTeamAScore(Number(e.target.value))}
          className="w-32 rounded-xl bg-slate-900 px-4 py-3 text-center text-2xl"
        />
        <span className="text-3xl">-</span>
        <input
          type="number"
          min="0"
          value={teamBScore}
          onChange={(e) => setTeamBScore(Number(e.target.value))}
          className="w-32 rounded-xl bg-slate-900 px-4 py-3 text-center text-2xl"
        />
      </div>

      <button
        onClick={saveResult}
        className="mt-8 rounded-xl bg-green-500 px-6 py-3 font-semibold text-slate-950"
      >
        Guardar resultado
      </button>
    </main>
  );
}