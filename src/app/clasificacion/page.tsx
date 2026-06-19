"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Row = {
  id: string;
  name: string;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goals: number;
  absences: number;
  points: number;
};

export default function ClasificacionPage() {
  const [players, setPlayers] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadClassification() {
    setLoading(true);

    const { data: playersData } = await supabase
      .from("players")
      .select("id,name")
      .eq("is_active", true);

    const { data: matchesData } = await supabase
      .from("matches")
      .select("*")
      .eq("status", "played");

    const { data: matchPlayersData } = await supabase
      .from("match_players")
      .select("*");

    if (
      !playersData ||
      !matchesData ||
      !matchPlayersData
    ) {
      setLoading(false);
      return;
    }

    const ranking: Row[] = playersData.map((player) => {
      const participations = matchPlayersData.filter(
        (mp) => mp.player_id === player.id
      );

      let matches = 0;
      let wins = 0;
      let draws = 0;
      let losses = 0;
      let goals = 0;
      let points = 0;

      participations.forEach((participation) => {
        const match = matchesData.find(
          (m) => m.id === participation.match_id
        );

        if (!match) return;

        matches += 1;
        points += 1;

        goals += Number(participation.goals ?? 0);
        points += Number(participation.goals ?? 0);

        const team = participation.team;

        const teamAScore = Number(
          match.team_a_score ?? 0
        );

        const teamBScore = Number(
          match.team_b_score ?? 0
        );

        if (teamAScore === teamBScore) {
          draws += 1;
          points += 1;
        } else if (
          (team === "A" && teamAScore > teamBScore) ||
          (team === "B" && teamBScore > teamAScore)
        ) {
          wins += 1;
          points += 3;
        } else {
          losses += 1;
        }
      });

      return {
        id: player.id,
        name: player.name,
        matches,
        wins,
        draws,
        losses,
        goals,
        absences: 0,
        points,
      };
    });

    ranking.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      return b.goals - a.goals;
    });

    setPlayers(ranking);
    setLoading(false);
  }

  useEffect(() => {
    loadClassification();
  }, []);

  return (
    <main className="mx-auto max-w-7xl p-6">

      <a
        href="/"
        className="text-sm text-slate-400 hover:text-white"
      >
        ← Volver al inicio
      </a>

      <section className="mt-8">

        <p className="text-sm font-medium text-green-400">
          Temporada actual
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Clasificación general
        </h1>

        <p className="mt-2 text-slate-300">
          Ranking individual calculado automáticamente.
        </p>

        {loading ? (
          <div className="mt-8">
            Cargando clasificación...
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[800px] border-collapse bg-white/5 text-left text-sm">

              <thead className="bg-white/10 text-slate-300">
                <tr>
                  <th className="px-4 py-3">Pos.</th>
                  <th className="px-4 py-3">Jugador</th>
                  <th className="px-4 py-3">PJ</th>
                  <th className="px-4 py-3">PG</th>
                  <th className="px-4 py-3">PE</th>
                  <th className="px-4 py-3">PP</th>
                  <th className="px-4 py-3">Goles</th>
                  <th className="px-4 py-3">Aus.</th>
                  <th className="px-4 py-3">Puntos</th>
                </tr>
              </thead>

              <tbody>
                {players.map((player, index) => (
                  <tr
                    key={player.id}
                    className="border-t border-white/10"
                  >
                    <td className="px-4 py-4 font-bold text-green-400">
                      {index + 1}
                    </td>

                    <td className="px-4 py-4 font-medium">
                      {player.name}
                    </td>

                    <td className="px-4 py-4">
                      {player.matches}
                    </td>

                    <td className="px-4 py-4">
                      {player.wins}
                    </td>

                    <td className="px-4 py-4">
                      {player.draws}
                    </td>

                    <td className="px-4 py-4">
                      {player.losses}
                    </td>

                    <td className="px-4 py-4">
                      {player.goals}
                    </td>

                    <td className="px-4 py-4">
                      {player.absences}
                    </td>

                    <td className="px-4 py-4 font-bold">
                      {player.points}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </section>

    </main>
  );
}