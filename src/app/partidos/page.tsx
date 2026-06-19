"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Match = {
  id: string;
  match_date: string;
  match_time: string;
  location: string;
  format: string;
  max_players: number;
  status: string;
  team_a_score: number | null;
  team_b_score: number | null;
  notes: string | null;
};

const statusLabel: Record<string, string> = {
  open: "Abierto",
  closed: "Cerrado",
  played: "Jugado",
};

const statusColor: Record<string, string> = {
  open: "bg-green-500/20 text-green-400 border border-green-500/30",
  closed: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  played: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
};

export default function AdminPartidosPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchMatches();
  }, []);

  async function fetchMatches() {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: false });

    if (!error && data) setMatches(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Seguro que quieres eliminar este partido? Se borraran tambien sus convocatorias y datos de equipos."
    );
    if (!confirmed) return;

    setDeletingId(id);

    await supabase.from("match_players").delete().eq("match_id", id);
    await supabase.from("match_signups").delete().eq("match_id", id);
    const { error } = await supabase.from("matches").delete().eq("id", id);

    if (error) {
      alert("Error al eliminar el partido.");
    } else {
      setMatches((prev) => prev.filter((m) => m.id !== id));
    }

    setDeletingId(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 text-lg">Cargando partidos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Partidos</h1>
            <p className="text-gray-400 mt-1">{matches.length} partidos registrados</p>
          </div>
          <Link
            href="/admin/partidos/nuevo"
            className="bg-green-500 hover:bg-green-400 text-black font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Nuevo partido
          </Link>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No hay partidos todavia.
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-white font-semibold text-lg">
                      {new Date(match.match_date).toLocaleDateString("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[match.status]}`}
                    >
                      {statusLabel[match.status] ?? match.status}
                    </span>
                  </div>
                  <div className="text-gray-400 text-sm space-y-0.5">
                    <p>{match.match_time?.slice(0, 5)} - {match.location}</p>
                    <p>Formato: {match.format} - Max. {match.max_players} jugadores</p>
                    {match.status === "played" &&
                      match.team_a_score !== null &&
                      match.team_b_score !== null && (
                        <p className="text-white font-medium mt-1">
                          Resultado: {match.team_a_score} - {match.team_b_score}
                        </p>
                      )}
                    {match.notes && (
                      <p className="text-gray-500 italic mt-1">{match.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 sm:flex-col sm:w-28">
                  <Link
                    href={`/admin/partidos/${match.id}`}
                    className="flex-1 text-center bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(match.id)}
                    disabled={deletingId === match.id}
                    className="flex-1 text-center bg-red-600/80 hover:bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {deletingId === match.id ? "..." : "Eliminar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}