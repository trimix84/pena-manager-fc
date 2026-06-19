"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import PlayerAvatar from "@/components/PlayerAvatar";

type Player = {
  id: string;
  name: string;
  nickname: string | null;
  email: string | null;
  main_position: string;
  general_rating: number;
  can_play_goalkeeper: boolean;
  photo_url: string | null;
};

export default function AdminJugadoresPage() {
  const { loading: authLoading } = useRequireAuth("admin");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) fetchPlayers();
  }, [authLoading]);

  async function fetchPlayers() {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("name");

    if (!error && data) setPlayers(data);
    setLoading(false);
  }

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

      <div className="mt-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Jugadores</h1>
        <a
          href="/admin/jugadores/nuevo"
          className="rounded-xl bg-green-500 px-5 py-3 font-semibold text-slate-950"
        >
          Nuevo jugador
        </a>
      </div>

      <div className="mt-8 space-y-4">
        {players.map((player) => (
          <div
            key={player.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <PlayerAvatar
                  name={player.name}
                  photoUrl={player.photo_url}
                  size="md"
                />
                <div>
                  <h2 className="text-xl font-bold">{player.name}</h2>
                  <p className="text-slate-300">{player.main_position}</p>
                  {player.nickname && (
                    <p className="text-sm text-slate-400">Apodo: {player.nickname}</p>
                  )}
                  {player.email && (
                    <p className="text-sm text-slate-400">{player.email}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {player.can_play_goalkeeper && (
                      <span className="rounded-lg bg-blue-500/20 px-2 py-1 text-xs text-blue-300">
                        Puede jugar de portero
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-900 px-4 py-2 text-center">
                  <p className="text-xs text-slate-400">General</p>
                  <p className="font-bold">{player.general_rating}</p>
                </div>
                <a
                  href={"/admin/jugadores/" + player.id}
                  className="rounded-xl border border-green-400/30 px-4 py-2 text-green-300 hover:bg-green-400/10"
                >
                  Editar
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
