import { supabase } from "@/lib/supabase";

export default async function JugadoresPage() {
  const { data: players, error } = await supabase
    .from("players")
    .select("*")
    .order("name");

  if (error) {
    return (
      <main className="p-10">
        <h1>Error al conectar con Supabase</h1>
        <pre>{error.message}</pre>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <h1 className="mb-8 text-3xl font-bold">
        Jugadores desde Supabase
      </h1>

      <div className="space-y-4">
        {players?.map((player) => (
          <div
            key={player.id}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <h2 className="font-bold">
              {player.name}
            </h2>

            <p>
              Posición: {player.main_position}
            </p>

            <p>
              Valoración: {player.general_rating}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}