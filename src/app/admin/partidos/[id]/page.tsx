"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { sendNotificationToAll } from "@/lib/notifications";
import Link from "next/link";

type MatchForm = {
  match_date: string;
  match_time: string;
  location: string;
  format: string;
  max_players: number;
  status: string;
  notes: string;
};

const FORMATS = ["7v7", "8v8", "9v9", "11v11"];
const STATUSES = [
  { value: "open", label: "Abierto" },
  { value: "closed", label: "Cerrado" },
  { value: "played", label: "Jugado" },
  { value: "cancelled", label: "Cancelado" },
];

export default function EditarPartidoPage() {
  const { loading: authLoading } = useRequireAuth("admin");
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState<MatchForm>({
    match_date: "",
    match_time: "",
    location: "",
    format: "7v7",
    max_players: 14,
    status: "open",
    notes: "",
  });

  const [originalStatus, setOriginalStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading) fetchMatch();
  }, [authLoading]);

  async function fetchMatch() {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      setError("Partido no encontrado.");
      setLoading(false);
      return;
    }

    setForm({
      match_date: data.match_date ?? "",
      match_time: data.match_time?.slice(0, 5) ?? "",
      location: data.location ?? "",
      format: data.format ?? "7v7",
      max_players: data.max_players ?? 14,
      status: data.status ?? "open",
      notes: data.notes ?? "",
    });
    setOriginalStatus(data.status ?? "open");

    setLoading(false);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "max_players" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const { error } = await supabase
      .from("matches")
      .update({
        match_date: form.match_date,
        match_time: form.match_time,
        location: form.location,
        format: form.format,
        max_players: form.max_players,
        status: form.status,
        notes: form.notes || null,
      })
      .eq("id", id);

    if (error) {
      setError("Error al guardar. Intentalo de nuevo.");
      setSaving(false);
      return;
    }

    if (form.status === "cancelled" && originalStatus !== "cancelled") {
      await sendNotificationToAll("match_cancelled", {
        date: new Date(form.match_date).toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }),
      });
    }

    setSuccess(true);
    setTimeout(() => router.push("/admin/partidos"), 1200);
    setSaving(false);
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 text-lg">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-10">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <Link
            href="/admin/partidos"
            className="text-gray-500 hover:text-white text-sm transition-colors"
          >
            Volver a partidos
          </Link>
          <h1 className="text-3xl font-bold text-white mt-3">Editar partido</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Fecha</label>
            <input
              type="date"
              name="match_date"
              value={form.match_date}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Hora</label>
            <input
              type="time"
              name="match_time"
              value={form.match_time}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Ubicacion</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Campo Municipal, Pabellon..."
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Formato</label>
            <select
              name="format"
              value={form.format}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Maximo jugadores</label>
            <input
              type="number"
              name="max_players"
              value={form.max_players}
              onChange={handleChange}
              min={2}
              max={30}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Estado</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              "Cancelado" enviara una notificacion a todos los jugadores.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Notas <span className="text-gray-500">(opcional)</span>
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Informacion adicional sobre el partido..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              Partido actualizado correctamente. Redirigiendo...
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Link
              href="/admin/partidos"
              className="flex-1 text-center bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium px-4 py-3 rounded-xl transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-semibold px-4 py-3 rounded-xl transition-colors"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}