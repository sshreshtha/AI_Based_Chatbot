function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/6 p-8 shadow-2xl shadow-slate-950/50 backdrop-blur md:p-10">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">React + Vite + Tailwind</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
            A clean starter template for your AI chatbot project.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300 md:text-xl">
            This repository is ready to share on GitHub with a minimal frontend and a FastAPI backend.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              href="https://vite.dev/guide/"
              target="_blank"
              rel="noreferrer"
            >
              Vite Docs
            </a>
            <a
              className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-200"
              href="https://tailwindcss.com/docs"
              target="_blank"
              rel="noreferrer"
            >
              Tailwind Docs
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
