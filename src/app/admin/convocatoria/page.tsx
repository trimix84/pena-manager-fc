"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/hooks/useRequireAuth";

type Match = {
  id: string;
  match_date: string;
  location: string;
};

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

export default function AdminConvocatoriaPage() {
  const { loading: authLoading } = useRequireAuth("admin");
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [authLoading]);

  async function fetchData() {
    const { data: matchData } = await supabase
      .from("matches")
      .select("*")
      .eq("status", "open")
      .single();

    const { data: playersData } = await supabase
      .from("players")
      .select("*")
      .order("name");

    const { data: signupsData } = await supabase
      .from("match_signups")
      .select("*");

    setMatch(matchData ?? null);
    setPlayers(playersData ?? []);
    setSignups(signupsData ?? []);
    setLoading(false);
  }

  const playerStatusMap = new Map(
    signups.map((s) => [s.player_id, s.status])
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 text-lg">Cargando...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <a href="/admin" className="text-sm text-green-400 hover:text-green-300">
        Volver al panel
      </a>

      <div className="mt-8">
        <h1 className="text-4xl font-bold">Gestion de convocatoria</h1>

        {match && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="font-bold">Partido abierto</p>
            <p className="text-slate-300">{match.match_date}</p>
            <p className="text-slate-400">{match.location}</p>
          </div>
        )}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white/10">
              <th className="px-4 py-3 text-left">Jugador</th>
              <th className="px-4 py-3 text-left">Posicion</th>
              <th className="px-4 py-3 text-left">Valoracion</th>
              <th className="px-4 py-3 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => {
              const status = playerStatusMap.get(player.id) ?? "Sin asignar";
              return (
                <tr key={player.id} className="border-t border-white/10">
                  <td className="px-4 py-3">{player.name}</td>
                  <td className="px-4 py-3">{player.main_position}</td>
                  <td className="px-4 py-3">{player.general_rating}</td>
                  <td className="px-4 py-3">
                    {status === "going" && "Confirmado"}
                    {status === "doubtful" && "Dudoso"}
                    {status === "reserve" && "Reserva"}
                    {status === "Sin asignar" && "Sin asignar"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}