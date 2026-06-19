"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/hooks/useRequireAuth";

type PlayerGoals = {
  id: string;
  goals: number;
  players: {
    id: string;
    name: string;
  };
};

export default function GoleadoresPage() {
  const { loading: authLoading } = useRequireAuth("admin");
  const [players, setPlayers] = useState<PlayerGoals[]>([]);
  const [matchId, setMatchId] = useState("");

  useEffect(() => {
    if (!authLoading) loadPlayers();
  }, [authLoading]);

  async function loadPlayers() {
    const { data: match } = await supabase
      .from("matches")
      .select("*")
      .eq("status", "played")
      .order("match_date", { ascending: false })
      .limit(1)
      .single();

    if (!match) return;

    setMatchId(match.id);

    const { data } = await supabase
      .from("match_players")
      .select(`
        id,
        goals,
        players (
          id,
          name
        )
      `)
      .eq("match_id", match.id);

    const rows =
      data?.map((row: any) => ({
        id: row.id,
        goals: row.goals ?? 0,
        players: Array.isArray(row.players) ? row.players[0] : row.players,
      })) ?? [];

    setPlayers(rows);
  }

  function updateGoals(matchPlayerId: string, goals: number) {
    setPlayers((current) =>
      current.map((player) =>
        player.id === matchPlayerId ? { ...player, goals } : player
      )
    );
  }

  async function saveGoals() {
    for (const player of players) {
      await supabase
        .from("match_players")
        .update({ goals: player.goals })
        .eq("id", player.id);
    }
    alert("Goleadores guardados");
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 text-lg">Cargando...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <a href="/admin" className="text-sm text-slate-400 hover:text-white">
        Volver al panel
      </a>

      <h1 className="mt-8 text-4xl font-bold">Registro de goleadores</h1>
      <p className="mt-2 text-slate-400">
        Introduce los goles marcados por cada jugador.
      </p>

      {!matchId && (
        <div className="mt-10 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-6">
          No existe ningun partido jugado.
        </div>
      )}

      {matchId && (
        <>
          <div className="mt-8 space-y-4">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between rounded-2xl bg-white/5 p-4"
              >
                <div className="font-medium">{player.players?.name}</div>
                <input
                  type="number"
                  min="0"
                  value={player.goals}
                  onChange={(e) => updateGoals(player.id, Number(e.target.value))}
                  className="w-24 rounded-xl border border-white/10 bg-slate-900 p-2 text-center"
                />
              </div>
            ))}
          </div>

          <button
            onClick={saveGoals}
            className="mt-8 rounded-xl bg-green-500 px-6 py-3 font-semibold text-slate-950"
          >
            Guardar goleadores
          </button>
        </>
      )}
    </main>
  );
}