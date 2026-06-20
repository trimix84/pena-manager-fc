import { supabase } from "@/lib/supabaseClient";

export default async function ConvocatoriaPage() {
  const { data: match } = await supabase
    .from("matches")
    .select("*")
    .eq("status", "open")
    .limit(1)
    .single();

  const { data: signups } = await supabase
    .from("match_signups")
    .select(`
      status,
      signup_order,
      players (
        name
      )
    `)
    .order("signup_order");

  const allSignups: any[] = signups ?? [];

  const confirmed = allSignups.filter((s) => s.status === "going");
  const reserves = allSignups.filter((s) => s.status === "reserve");
  const doubtful = allSignups.filter((s) => s.status === "doubtful");

  function getPlayerName(signup: any) {
    return Array.isArray(signup.players)
      ? signup.players[0]?.name
      : signup.players?.name;
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <section className="mx-auto max-w-5xl">
        <a href="/" className="text-sm text-green-400 hover:text-green-300">
          Volver al inicio
        </a>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-medium text-green-400">Convocatoria abierta</p>

          <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold">Partido del jueves</h1>
              <p className="mt-2 text-slate-300">
                {match?.format} - Maximo {match?.max_players} jugadores
              </p>
              <p className="mt-1 text-slate-400">{match?.location}</p>
              <p className="mt-1 text-slate-400">
                {match?.match_date} - {match?.match_time}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 px-5 py-4 text-center">
              <p className="text-3xl font-bold text-green-400">
                {confirmed.length}/{match?.max_players}
              </p>
              <p className="text-sm text-slate-300">confirmados</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold text-green-400">Confirmados</h2>
            <div className="mt-5 space-y-3">
              {confirmed.map((signup, index) => (
                <div key={index} className="rounded-xl bg-slate-900 px-4 py-3">
                  {getPlayerName(signup)}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold text-yellow-300">Dudosos</h2>
            <div className="mt-5 space-y-3">
              {doubtful.map((signup, index) => (
                <div key={index} className="rounded-xl bg-slate-900 px-4 py-3">
                  {getPlayerName(signup)}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold text-orange-300">Reservas</h2>
            <div className="mt-5 space-y-3">
              {reserves.map((signup, index) => (
                <div key={index} className="rounded-xl bg-slate-900 px-4 py-3">
                  {getPlayerName(signup)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}