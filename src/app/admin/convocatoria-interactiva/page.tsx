"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/hooks/useRequireAuth";

type Player = {
  id: string;
  name: string;
  main_position: string;
  general_rating: number;
};

type Signup = {
  player_id: string;
  status: string;
};

export default function ConvocatoriaInteractivaPage() {
  const { loading: authLoading } = useRequireAuth("admin");
  const [players, setPlayers] = useState<Player[]>([]);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [matchId, setMatchId] = useState<string>("");

  useEffect(() => {
    if (!authLoading) loadData();
  }, [authLoading]);

  async function loadData() {
    const { data: match } = await supabase
      .from("matches")
      .select("*")
      .eq("status", "open")
      .single();

    if (match) setMatchId(match.id);

    const { data: playersData } = await supabase
      .from("players")
      .select("*")
      .order("name");

    const { data: signupData } = await supabase
      .from("match_signups")
      .select("*");

    setPlayers(playersData ?? []);
    setSignups(signupData ?? []);
  }

  function getStatus(playerId: string) {
    const signup = signups.find((s) => s.player_id === playerId);
    return signup?.status ?? "none";
  }

  async function updateStatus(playerId: string, status: string) {
    const existing = signups.find((s) => s.player_id === playerId);

    if (existing) {
      await supabase
        .from("match_signups")
        .update({ status })
        .eq("player_id", playerId);
    } else {
      await supabase.from("match_signups").insert({
        match_id: matchId,
        player_id: playerId,
        status,
        signup_order: signups.length + 1,
      });
    }

    await loadData();
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
      <a href="/admin" className="text-sm text-green-400">
        Volver al panel
      </a>

      <h1 className="mt-6 text-4xl font-bold">Convocatoria interactiva</h1>

      <div className="mt-8 space-y-4">
        {players.map((player) => {
          const status = getStatus(player.id);
          return (
            <div
              key={player.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-bold">{player.name}</h2>
                  <p className="text-slate-400">{player.main_position}</p>
                  <p className="text-slate-400">Valoracion: {player.general_rating}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateStatus(player.id, "going")}
                    className={`rounded-xl px-4 py-2 ${
                      status === "going" ? "bg-green-500 text-black" : "bg-slate-800"
                    }`}
                  >
                    Confirmado
                  </button>
                  <button
                    onClick={() => updateStatus(player.id, "doubtful")}
                    className={`rounded-xl px-4 py-2 ${
                      status === "doubtful" ? "bg-yellow-500 text-black" : "bg-slate-800"
                    }`}
                  >
                    Dudoso
                  </button>
                  <button
                    onClick={() => updateStatus(player.id, "reserve")}
                    className={`rounded-xl px-4 py-2 ${
                      status === "reserve" ? "bg-orange-500 text-black" : "bg-slate-800"
                    }`}
                  >
                    Reserva
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}