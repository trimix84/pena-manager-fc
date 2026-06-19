"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import AvatarUpload from "@/components/AvatarUpload";
import { useRouter } from "next/navigation";

type Player = {
  id: string;
  name: string;
  nickname: string | null;
  email: string | null;
  main_position: string | null;
  general_rating: number;
  photo_url: string | null;
  role: string;
};

export default function PerfilPage() {
  const { loading: authLoading } = useRequireAuth();
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) fetchPlayer();
  }, [authLoading]);

  async function fetchPlayer() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("email", session.user.email)
      .single();

    if (error || !data) {
      setLoading(false);
      return;
    }

    setPlayer(data);
    setPhotoUrl(data.photo_url ?? null);
    setLoading(false);
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 text-lg">Cargando...</p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 text-lg">No se encontro tu perfil.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mi perfil</h1>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
          <AvatarUpload
            playerId={player.id}
            currentUrl={photoUrl}
            onUpload={(url) => setPhotoUrl(url)}
          />

          <div className="space-y-3 pt-2">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nombre</p>
              <p className="text-white font-medium">{player.name}</p>
            </div>

            {player.nickname && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Apodo</p>
                <p className="text-white font-medium">{player.nickname}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
              <p className="text-white font-medium">{player.email}</p>
            </div>

            {player.main_position && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Posicion</p>
                <p className="text-white font-medium capitalize">{player.main_position}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Valoracion general</p>
              <p className="text-white font-bold text-2xl">{player.general_rating}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Rol</p>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                player.role === "admin"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
              }`}>
                {player.role === "admin" ? "Administrador" : "Jugador"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}