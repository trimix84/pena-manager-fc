"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useParams, useRouter } from "next/navigation";
import AvatarUpload from "@/components/AvatarUpload";

export default function EditarJugadorPage() {
  const { loading: authLoading } = useRequireAuth("admin");
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [mainPosition, setMainPosition] = useState("");
  const [secondaryPositions, setSecondaryPositions] = useState("");
  const [traits, setTraits] = useState("");
  const [generalRating, setGeneralRating] = useState(5);
  const [defenseRating, setDefenseRating] = useState(5);
  const [midfieldRating, setMidfieldRating] = useState(5);
  const [attackRating, setAttackRating] = useState(5);
  const [canPlayGoalkeeper, setCanPlayGoalkeeper] = useState(false);

  useEffect(() => {
    if (!authLoading) loadPlayer();
  }, [authLoading]);

  async function loadPlayer() {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setName(data.name ?? "");
    setPhotoUrl(data.photo_url ?? null);
    setMainPosition(data.main_position ?? "");
    setSecondaryPositions(
      Array.isArray(data.secondary_positions)
        ? data.secondary_positions.join(", ")
        : data.secondary_positions ?? ""
    );
    setTraits(
      Array.isArray(data.traits)
        ? data.traits.join(", ")
        : data.traits ?? ""
    );
    setGeneralRating(Number(data.general_rating ?? 5));
    setDefenseRating(Number(data.defense_rating ?? 5));
    setMidfieldRating(Number(data.midfield_rating ?? 5));
    setAttackRating(Number(data.attack_rating ?? 5));
    setCanPlayGoalkeeper(data.can_play_goalkeeper ?? false);
    setLoading(false);
  }

  async function savePlayer() {
    const secondaryPositionsArray = secondaryPositions
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const traitsArray = traits
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const { error } = await supabase
      .from("players")
      .update({
        main_position: mainPosition || null,
        secondary_positions: secondaryPositionsArray,
        traits: traitsArray,
        general_rating: generalRating,
        defense_rating: defenseRating,
        midfield_rating: midfieldRating,
        attack_rating: attackRating,
        can_play_goalkeeper: canPlayGoalkeeper,
      })
      .eq("id", params.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Jugador actualizado correctamente");
    router.push("/admin/jugadores");
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 text-lg">Cargando...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <a href="/admin/jugadores" className="text-sm text-slate-400 hover:text-white">
        Volver a jugadores
      </a>

      <h1 className="mt-8 text-4xl font-bold">{name}</h1>
      <p className="mt-2 text-slate-400">Editar valoracion y caracteristicas</p>

      <div className="mt-8 max-w-2xl space-y-6">

        <AvatarUpload
          playerId={params.id as string}
          currentUrl={photoUrl}
          onUpload={(url) => setPhotoUrl(url)}
        />

        <div>
          <label className="mb-2 block">Posicion principal</label>
          <select
            value={mainPosition}
            onChange={(e) => setMainPosition(e.target.value)}
            className="w-full rounded-xl bg-slate-900 px-4 py-3"
          >
            <option value="">Seleccionar</option>
            <option value="defensa">Defensa</option>
            <option value="mediocampo">Mediocampo</option>
            <option value="delantero">Delantero</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block">Posiciones secundarias</label>
          <input
            type="text"
            value={secondaryPositions}
            onChange={(e) => setSecondaryPositions(e.target.value)}
            placeholder="defensa, mediocampo"
            className="w-full rounded-xl bg-slate-900 px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block">Caracteristicas</label>
          <input
            type="text"
            value={traits}
            onChange={(e) => setTraits(e.target.value)}
            placeholder="Rapido, Buen pase, Lider"
            className="w-full rounded-xl bg-slate-900 px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block">Valoracion general</label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={generalRating}
            onChange={(e) => setGeneralRating(Number(e.target.value))}
            className="w-full rounded-xl bg-slate-900 px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block">Defensa</label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={defenseRating}
            onChange={(e) => setDefenseRating(Number(e.target.value))}
            className="w-full rounded-xl bg-slate-900 px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block">Mediocampo</label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={midfieldRating}
            onChange={(e) => setMidfieldRating(Number(e.target.value))}
            className="w-full rounded-xl bg-slate-900 px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block">Ataque</label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={attackRating}
            onChange={(e) => setAttackRating(Number(e.target.value))}
            className="w-full rounded-xl bg-slate-900 px-4 py-3"
          />
        </div>

        <div className="rounded-xl bg-slate-900 p-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={canPlayGoalkeeper}
              onChange={(e) => setCanPlayGoalkeeper(e.target.checked)}
            />
            Puede jugar de portero
          </label>
        </div>

        <button
          onClick={savePlayer}
          className="rounded-xl bg-green-500 px-6 py-3 font-semibold text-slate-950"
        >
          Guardar cambios
        </button>
      </div>
    </main>
  );
}