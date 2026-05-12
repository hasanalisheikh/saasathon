const waveDelays = ["-4.8s", "-3.2s", "-1.6s"]

export function HeroSignal() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 sm:h-[50rem] sm:w-[50rem]">
        <div className="absolute inset-[20%] rounded-full bg-[#097fe8]/16 blur-3xl" />
        <div className="absolute inset-[9%] rounded-full border border-[#0f274a]/80 opacity-70" />

        {waveDelays.map((delay) => (
          <div
            className="absolute inset-[19%] rounded-full border border-[#38bdf8]/14 shadow-[0_0_52px_rgba(9,127,232,0.1)] motion-reduce:animate-none animate-[monad-wave-resize_5.6s_cubic-bezier(0.2,0.8,0.2,1)_infinite]"
            key={delay}
            style={{ animationDelay: delay }}
          />
        ))}

        <div className="absolute inset-[21%] rounded-full border border-[#60a5fa]/20 shadow-[0_0_80px_rgba(9,127,232,0.18)]" />
        <div className="absolute inset-[21%] rounded-full bg-[conic-gradient(from_120deg,rgba(9,127,232,0)_0deg,rgba(9,127,232,0.5)_70deg,rgba(125,211,252,0.08)_110deg,rgba(9,127,232,0)_180deg,rgba(9,127,232,0)_230deg,rgba(56,189,248,0.36)_300deg,rgba(9,127,232,0)_360deg)] p-px opacity-75 motion-reduce:animate-none animate-[monad-spin_18s_linear_infinite]">
          <div className="h-full w-full rounded-full bg-background/88 backdrop-blur-[1px]" />
        </div>

        <div className="absolute inset-[31%] rounded-full bg-[conic-gradient(from_300deg,rgba(9,127,232,0)_0deg,rgba(56,189,248,0.42)_75deg,rgba(9,127,232,0.05)_110deg,rgba(9,127,232,0)_170deg,rgba(9,127,232,0)_240deg,rgba(96,165,250,0.34)_312deg,rgba(9,127,232,0)_360deg)] p-px opacity-65 motion-reduce:animate-none animate-[monad-spin-reverse_12s_linear_infinite]">
          <div className="h-full w-full rounded-full bg-background/93" />
        </div>

        <div className="absolute inset-0 rounded-full border border-[#38bdf8]/10 motion-reduce:animate-none animate-[monad-pulse_7s_ease-in-out_infinite]" />

        <div className="absolute left-[32%] top-[27%] -translate-x-1/2 -translate-y-1/2">
          <div className="h-28 w-56 rounded-full bg-[#097fe8]/12 blur-3xl motion-reduce:animate-none animate-[monad-drift_11s_ease-in-out_infinite] sm:h-40 sm:w-96" />
        </div>
        <div className="absolute left-[66%] top-[46%] -translate-x-1/2 -translate-y-1/2">
          <div className="h-24 w-40 rounded-full bg-[#38bdf8]/10 blur-3xl motion-reduce:animate-none animate-[monad-drift_9s_ease-in-out_infinite_reverse] sm:h-36 sm:w-64" />
        </div>

        <div className="absolute inset-[14%] motion-reduce:animate-none animate-[monad-spin_14s_linear_infinite]">
          <div className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#7dd3fc]/80 shadow-[0_0_16px_rgba(125,211,252,0.75)]" />
          <div className="absolute bottom-[7%] right-[14%] h-2 w-2 rounded-full bg-[#097fe8]/80 shadow-[0_0_14px_rgba(9,127,232,0.8)]" />
        </div>

        <div className="absolute inset-x-[4%] top-1/2 h-px -translate-y-1/2 bg-[linear-gradient(90deg,transparent,rgba(96,165,250,0.22),transparent)] opacity-55" />
        <div className="absolute inset-y-[5%] left-1/2 w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(56,189,248,0.12),transparent)] opacity-45" />
      </div>
    </div>
  )
}
