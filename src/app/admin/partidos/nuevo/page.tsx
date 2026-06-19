"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { sendNotificationToAll } from "@/lib/notifications";
import { useRouter } from "next/navigation";

export default function NuevoPartidoPage() {
  const { loading: authLoading } = useRequireAuth("admin");
  const router = useRouter();

  const [matchDate, setMatchDate] = useState("");
  const [matchTime, setMatchTime] = useState("20:00");
  const [location, setLocation] = useState("");
  const [format, setFormat] = useState("7 vs 7");
  const [maxPlayers, setMaxPlayers] = useState(14);

  async function createMatch() {
    if (!matchDate) {
      alert("Selecciona una fecha");
      return;
    }

    const { error } = await supabase
      .from("matches")
      .insert({
        match_date: matchDate,
        match_time: matchTime,
        location: location,
        format: format,
        max_players: maxPlayers,
        status: "open",
      });

    if (error) {
      alert(error.message);
      return;
    }

    await sendNotificationToAll("match_created", {
      date: new Date(matchDate).toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      location,
    });

    alert("Partido creado correctamente");
    router.push("/admin/partidos");
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 text-lg">Cargando...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <a href="/admin/partidos" className="text-sm text-slate-400 hover:text-white">
        Volver a partidos
      </a>

      <h1 className="mt-8 text-4xl font-bold">Nuevo partido</h1>

      <div className="mt-8 space-y-6">
        <div>
          <label className="mb-2 block">Fecha</label>
          <input
            type="date"
            value={matchDate}
            onChange={(e) => setMatchDate(e.target.value)}
            className="w-full rounded-xl bg-slate-900 px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block">Hora</label>
          <input
            type="time"
            value={matchTime}
            onChange={(e) => setMatchTime(e.target.value)}
            className="w-full rounded-xl bg-slate-900 px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block">Ubicacion</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Campo municipal..."
            className="w-full rounded-xl bg-slate-900 px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block">Formato</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full rounded-xl bg-slate-900 px-4 py-3"
          >
            <option value="5 vs 5">5 vs 5</option>
            <option value="7 vs 7">7 vs 7</option>
            <option value="8 vs 8">8 vs 8</option>
            <option value="11 vs 11">11 vs 11</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block">Maximo jugadores</label>
          <input
            type="number"
            min="10"
            max="30"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Number(e.target.value))}
            className="w-full rounded-xl bg-slate-900 px-4 py-3"
          />
        </div>

        <button
          onClick={createMatch}
          className="rounded-xl bg-green-500 px-6 py-3 font-semibold text-slate-950"
        >
          Crear partido
        </button>
      </div>
    </main>
  );
}