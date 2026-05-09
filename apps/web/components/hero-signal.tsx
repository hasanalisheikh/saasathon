export function HeroSignal() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <div className="absolute h-[19rem] w-[19rem] rounded-full bg-[#097fe8]/18 blur-3xl sm:h-[27rem] sm:w-[27rem]" />
      <div className="absolute h-[25rem] w-[25rem] rounded-full border border-[#0f274a] opacity-80 sm:h-[35rem] sm:w-[35rem]" />

      <div className="absolute h-[18rem] w-[18rem] rounded-full border border-[#60a5fa]/20 shadow-[0_0_80px_rgba(9,127,232,0.18)] sm:h-[26rem] sm:w-[26rem]" />
      <div className="absolute h-[18rem] w-[18rem] rounded-full bg-[conic-gradient(from_120deg,rgba(9,127,232,0)_0deg,rgba(9,127,232,0.72)_70deg,rgba(125,211,252,0.1)_110deg,rgba(9,127,232,0)_180deg,rgba(9,127,232,0)_230deg,rgba(56,189,248,0.55)_300deg,rgba(9,127,232,0)_360deg)] p-px opacity-90 motion-reduce:animate-none animate-[monad-spin_18s_linear_infinite] sm:h-[26rem] sm:w-[26rem]">
        <div className="h-full w-full rounded-full bg-background/86 backdrop-blur-[1px]" />
      </div>

      <div className="absolute h-[14rem] w-[14rem] rounded-full bg-[conic-gradient(from_300deg,rgba(9,127,232,0)_0deg,rgba(56,189,248,0.62)_75deg,rgba(9,127,232,0.06)_110deg,rgba(9,127,232,0)_170deg,rgba(9,127,232,0)_240deg,rgba(96,165,250,0.5)_312deg,rgba(9,127,232,0)_360deg)] p-px opacity-80 motion-reduce:animate-none animate-[monad-spin-reverse_12s_linear_infinite] sm:h-[20rem] sm:w-[20rem]">
        <div className="h-full w-full rounded-full bg-background/92" />
      </div>

      <div className="absolute h-[28rem] w-[28rem] rounded-full border border-[#38bdf8]/10 motion-reduce:animate-none animate-[monad-pulse_7s_ease-in-out_infinite] sm:h-[38rem] sm:w-[38rem]" />

      <div className="absolute -translate-x-10 -translate-y-14 sm:-translate-x-14 sm:-translate-y-20">
        <div className="h-28 w-56 rounded-full bg-[#097fe8]/14 blur-3xl motion-reduce:animate-none animate-[monad-drift_11s_ease-in-out_infinite] sm:h-36 sm:w-80" />
      </div>
      <div className="absolute translate-x-16 translate-y-12 sm:translate-x-28 sm:translate-y-20">
        <div className="h-24 w-40 rounded-full bg-[#38bdf8]/12 blur-3xl motion-reduce:animate-none animate-[monad-drift_9s_ease-in-out_infinite_reverse] sm:h-32 sm:w-56" />
      </div>

      <div className="absolute h-[22rem] w-[22rem] motion-reduce:animate-none animate-[monad-spin_14s_linear_infinite] sm:h-[30rem] sm:w-[30rem]">
        <div className="absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#7dd3fc] shadow-[0_0_18px_rgba(125,211,252,0.9)]" />
        <div className="absolute bottom-3 right-10 h-2.5 w-2.5 rounded-full bg-[#097fe8] shadow-[0_0_16px_rgba(9,127,232,0.9)] sm:bottom-5 sm:right-16" />
      </div>

      <div className="absolute inset-x-6 top-1/2 h-px -translate-y-1/2 bg-[linear-gradient(90deg,transparent,rgba(96,165,250,0.35),transparent)] opacity-70" />
      <div className="absolute inset-y-10 left-1/2 w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(56,189,248,0.18),transparent)] opacity-60" />
    </div>
  )
}
