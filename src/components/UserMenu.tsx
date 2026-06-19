"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import PlayerAvatar from "@/components/PlayerAvatar";
import NotificationBell from "@/components/NotificationBell";

type Player = {
  id: string;
  name: string;
  nickname: string | null;
  role: string;
  photo_url: string | null;
};

export default function UserMenu() {
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchCurrentPlayer();
  }, []);

  async function fetchCurrentPlayer() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("players")
      .select("id, name, nickname, role, photo_url")
      .eq("email", session.user.email)
      .single();

    if (data) setPlayer(data);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (!player) return null;

  return (
    <div className="flex items-center gap-2">
      <NotificationBell playerId={player.id} />

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-3 py-2 transition-colors"
        >
          <PlayerAvatar
            name={player.name}
            photoUrl={player.photo_url}
            size="sm"
          />
          <span className="text-white text-sm font-medium">
            {player.nickname ?? player.name.split(" ")[0]}
          </span>
          <span className="text-gray-400 text-xs">v</span>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <p className="text-white text-sm font-medium">{player.name}</p>
              <p className="text-gray-400 text-xs capitalize">
                {player.role === "admin" ? "Administrador" : "Jugador"}
              </p>
            </div>
            <button
              onClick={() => { setOpen(false); router.push("/perfil"); }}
              className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 text-sm transition-colors"
            >
              Mi perfil
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-800 text-sm transition-colors"
            >
              Cerrar sesion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}