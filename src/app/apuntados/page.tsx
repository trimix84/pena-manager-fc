import { supabase } from "@/lib/supabaseClient";

export default async function ApuntadosPage() {
  const { data, error } = await supabase
    .from("match_signups")
    .select(`
      status,
      signup_order,
      players (
        name
      )
    `)
    .order("signup_order");

  if (error) {
    return (
      <main className="p-10">
        <pre>{error.message}</pre>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <h1 className="mb-8 text-3xl font-bold">Apuntados</h1>

      <div className="space-y-3">
        {data?.map((signup: any, index) => {
          const player = Array.isArray(signup.players) ? signup.players[0] : signup.players;

          return (
            <div
              key={index}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <p>{player?.name}</p>
              <p className="text-slate-400">{signup.status}</p>
            </div>
          );
        })}
      </div>
    </main>
  );
}