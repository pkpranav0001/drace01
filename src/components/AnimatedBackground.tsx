export function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -inset-[20%]"
        style={{
          background: "var(--gradient-mesh)",
          filter: "blur(40px)",
          animation: "mesh-drift 28s ease-in-out infinite",
        }}
      />
      <div
        className="absolute left-[8%] top-[12%] h-[42vw] w-[42vw] rounded-full"
        style={{
          background: "color-mix(in oklab, var(--accent) 35%, transparent)",
          filter: "blur(120px)",
          opacity: 0.08,
          animation: "orb-float-a 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute right-[-5%] top-[35%] h-[34vw] w-[34vw] rounded-full"
        style={{
          background: "color-mix(in oklab, var(--secondary) 90%, transparent)",
          filter: "blur(140px)",
          opacity: 0.5,
          animation: "orb-float-b 26s ease-in-out infinite",
        }}
      />
      <div
        className="absolute left-[20%] bottom-[-10%] h-[38vw] w-[38vw] rounded-full"
        style={{
          background: "color-mix(in oklab, var(--accent) 30%, transparent)",
          filter: "blur(150px)",
          opacity: 0.07,
          animation: "orb-float-c 30s ease-in-out infinite",
        }}
      />
      <div className="grain-overlay" />
    </div>
  );
}
