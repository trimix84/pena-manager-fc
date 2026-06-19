export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 rounded-full bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400">
          Peña Manager FC
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Gestiona tus partidos de fútbol con tu peña
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-300">
          Convocatorias semanales, clasificación individual, goles, ausencias,
          equipos equilibrados y perfiles de jugadores.
        </p>

        <div className="mt-10 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-3xl font-bold text-green-400">7v7</p>
            <p className="mt-2 text-sm text-slate-300">Formato habitual</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-3xl font-bold text-green-400">14</p>
            <p className="mt-2 text-sm text-slate-300">Jugadores por partido</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-3xl font-bold text-green-400">30</p>
            <p className="mt-2 text-sm text-slate-300">Jugadores en el grupo</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href="/login"
            className="rounded-xl bg-green-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-green-400"
          >
            Iniciar sesión
          </a>

          <a
            href="/clasificacion"
            className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Ver clasificación
          </a>

          <a
            href="/convocatoria"
            className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Ver convocatoria
          </a>

          <a
            href="/admin"
            className="rounded-xl border border-green-400/30 px-6 py-3 font-semibold text-green-300 transition hover:bg-green-400/10"
          >
            Admin
          </a>
        </div>
      </section>
    </main>
  );
}