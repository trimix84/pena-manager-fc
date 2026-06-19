"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function AdminPage() {
  const { loading: authLoading } = useRequireAuth("admin");

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 text-lg">Cargando...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <a href="/" className="text-sm text-gray-400 hover:text-white">
        Volver al inicio
      </a>

      <h1 className="mt-6 text-4xl font-bold">Panel de administracion</h1>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <a href="/admin/jugadores" className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors">
          Jugadores
        </a>
        <a href="/admin/partidos" className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors">
          Partidos
        </a>
        <a href="/admin/convocatoria" className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors">
          Convocatoria
        </a>
        <a href="/admin/convocatoria-interactiva" className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors">
          Convocatoria interactiva
        </a>
        <a href="/admin/equipos" className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors">
          Equipos equilibrados
        </a>
        <a href="/admin/resultados" className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors">
          Registrar resultado
        </a>
        <a href="/admin/goleadores" className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors">
          Goleadores
        </a>
      </div>
    </main>
  );
}