"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRequireAuth } from "@/hooks/useRequireAuth";

type Player = {
  id: string;
  name: string;
  main_position: string;
  general_rating: number;
  defense_rating: number;
  midfield_rating: number;
  attack_rating: number;
  can_play_goalkeeper: boolean;
};

export default function EquiposPage() {
  const { loading: authLoading } = useRequireAuth("admin");
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamA, setTeamA] = useState<Player[]>([]);
  const [teamB, setTeamB] = useState<Player[]>([]);
  const [matchId, setMatchId] = useState("");

  useEffect(() => {
    if (!authLoading) loadPlayers();
  }, [authLoading]);

  async function loadPlayers() {
    const { data: match } = await supabase
      .from("matches")
      .select("*")
      .eq("status", "open")
      .single();

    if (!match) return;

    setMatchId(match.id);

    const { data: signups } = await supabase
      .from("match_signups")
      .select(`
        status,
        players (
          id,
          name,
          main_position,
          general_rating,
          defense_rating,
          midfield_rating,
          attack_rating,
          can_play_goalkeeper
        )
      `);

    const eligiblePlayers: Player[] =
      signups
        ?.filter((signup: any) => signup.status === "going" || signup.status === "doubtful")
        .map((signup: any) => Array.isArray(signup.players) ? signup.players[0] : signup.players)
        .filter(Boolean) ?? [];

    setPlayers(eligiblePlayers);
  }

  function balanceGroup(
    group: Player[],
    ratingField: "general_rating" | "defense_rating" | "midfield_rating" | "attack_rating",
    teamAPlayers: Player[],
    teamBPlayers: Player[]
  ) {
    const sorted = [...group].sort((a, b) => Number(b[ratingField]) - Number(a[ratingField]));
    let scoreA = 0;
    let scoreB = 0;

    for (const player of sorted) {
      if (scoreA <= scoreB) {
        teamAPlayers.push(player);
        scoreA += Number(player[ratingField]);
      } else {
        teamBPlayers.push(player);
        scoreB += Number(player[ratingField]);
      }
    }
  }

  function generateTeams() {
    const defenses = players.filter((p) => p.main_position === "defensa");
    const midfielders = players.filter((p) => p.main_position === "mediocampo");
    const forwards = players.filter((p) => p.main_position === "delantero");
    const others = players.filter(
      (p) => p.main_position !== "defensa" && p.main_position !== "mediocampo" && p.main_position !== "delantero"
    );

    const a: Player[] = [];
    const b: Player[] = [];

    balanceGroup(defenses, "defense_rating", a, b);
    balanceGroup(midfielders, "midfield_rating", a, b);
    balanceGroup(forwards, "attack_rating", a, b);
    balanceGroup(others, "general_rating", a, b);

    setTeamA(a);
    setTeamB(b);
  }

  async function saveTeams() {
    if (!matchId) return;

    const { error: deleteError } = await supabase
      .from("match_players")
      .delete()
      .eq("match_id", matchId);

    if (deleteError) {
      alert(deleteError.message);
      return;
    }

    const rows = [
      ...teamA.map((player) => ({ match_id: matchId, player_id: player.id, team: "A", played: true })),
      ...teamB.map((player) => ({ match_id: matchId, player_id: player.id, team: "B", played: true })),
    ];

    const { error } = await supabase.from("match_players").insert(rows);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Equipos guardados");
  }

  function total(
    team: Player[],
    field: "general_rating" | "defense_rating" | "midfield_rating" | "attack_rating"
  ) {
    return team.reduce((acc, player) => acc + Number(player[field] ?? 0), 0);
  }

  const goalkeepersA = teamA.filter((p) => p.can_play_goalkeeper).length;
  const goalkeepersB = teamB.filter((p) => p.can_play_goalkeeper).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 text-lg">Cargando...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl p-6">
      <a href="/admin" className="text-sm text-slate-400 hover:text-white">
        Volver al panel
      </a>

      <h1 className="mt-8 text-4xl font-bold">Equipos equilibrados V2</h1>

      <div className="mt-6 flex gap-4">
        <button
          onClick={generateTeams}
          className="rounded-xl bg-green-500 px-6 py-3 font-semibold text-slate-950"
        >
          Generar equipos
        </button>
        <button
          onClick={saveTeams}
          className="rounded-xl bg-blue-500 px-6 py-3 font-semibold text-slate-950"
        >
          Guardar equipos
        </button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white/5 p-4">
          <h3 className="font-bold text-green-400">Equipo A</h3>
          <p>General: {total(teamA, "general_rating").toFixed(1)}</p>
          <p>Defensa: {total(teamA, "defense_rating").toFixed(1)}</p>
          <p>Medio: {total(teamA, "midfield_rating").toFixed(1)}</p>
          <p>Ataque: {total(teamA, "attack_rating").toFixed(1)}</p>
          <p>Porteros: {goalkeepersA}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <h3 className="font-bold text-blue-400">Equipo B</h3>
          <p>General: {total(teamB, "general_rating").toFixed(1)}</p>
          <p>Defensa: {total(teamB, "defense_rating").toFixed(1)}</p>
          <p>Medio: {total(teamB, "midfield_rating").toFixed(1)}</p>
          <p>Ataque: {total(teamB, "attack_rating").toFixed(1)}</p>
          <p>Porteros: {goalkeepersB}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-green-500/20 bg-white/5 p-6">
          <h2 className="text-2xl font-bold text-green-400">Equipo A</h2>
          <div className="mt-6 space-y-3">
            {teamA.map((player) => (
              <div key={player.id} className="rounded-xl bg-slate-900 p-4">
                <div className="flex justify-between">
                  <span>{player.name}</span>
                  <span>{player.main_position}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-blue-500/20 bg-white/5 p-6">
          <h2 className="text-2xl font-bold text-blue-400">Equipo B</h2>
          <div className="mt-6 space-y-3">
            {teamB.map((player) => (
              <div key={player.id} className="rounded-xl bg-slate-900 p-4">
                <div className="flex justify-between">
                  <span>{player.name}</span>
                  <span>{player.main_position}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}