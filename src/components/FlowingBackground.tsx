import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

export function FlowingBackground() {
  // Motion values for raw mouse coordinates (normalized from -1 to 1)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for lag-free motion transitions
  const smoothX = useSpring(mouseX, { damping: 45, stiffness: 50 });
  const smoothY = useSpring(mouseY, { damping: 45, stiffness: 50 });

  // Layer A Parallax (Foreground Blobs: max 25px translate)
  const xA = useTransform(smoothX, [-1, 1], [-25, 25]);
  const yA = useTransform(smoothY, [-1, 1], [-25, 25]);

  // Layer B Parallax (Background Blobs: max 15px translate)
  const xB = useTransform(smoothX, [-1, 1], [-15, 15]);
  const yB = useTransform(smoothY, [-1, 1], [-15, 15]);

  // Layer C Parallax (Soft Light Beams: max 10px translate)
  const xLight = useTransform(smoothX, [-1, 1], [-10, 10]);
  const yLight = useTransform(smoothY, [-1, 1], [-10, 10]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;

      // Map mouse coordinates to [-1, 1] relative to center
      const xOffset = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const yOffset = (e.clientY - innerHeight / 2) / (innerHeight / 2);

      mouseX.set(xOffset);
      mouseY.set(yOffset);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
    >
      {/* LAYER 4: ROTATING ORGANIC MESH GRADIENT (Flowing Color Backdrop) */}
      <div
        className="absolute origin-center"
        style={{
          width: "180vmax",
          height: "180vmax",
          left: "calc(50vw - 90vmax)",
          top: "calc(50vh - 90vmax)",
          background:
            "conic-gradient(from 0deg, oklch(0.965 0.012 70), oklch(0.91 0.025 75), oklch(0.93 0.03 140), oklch(0.95 0.015 80), oklch(0.965 0.012 70))",
          filter: "blur(60px)",
          animation: "rotate-gradient 60s linear infinite",
        }}
      />

      {/* LAYER B: BACKGROUND AURORA BLOBS (Translates at medium speed - max 15px) */}
      <motion.div style={{ x: xB, y: yB }} className="absolute inset-0">
        {/* Blob 2: Warm Beige */}
        <div
          className="absolute -right-[10%] top-[10%] h-[55vw] w-[55vw] rounded-full opacity-[0.38]"
          style={{
            background: "oklch(0.86 0.05 75)",
            filter: "blur(110px)",
            animation: "aurora-blob-b 35s ease-in-out infinite",
          }}
        />

        {/* Blob 4: Muted Champagne */}
        <div
          className="absolute left-[5%] top-[40%] h-[48vw] w-[48vw] rounded-full opacity-[0.35]"
          style={{
            background: "oklch(0.88 0.07 85)",
            filter: "blur(100px)",
            animation: "aurora-blob-d 40s ease-in-out infinite",
          }}
        />
      </motion.div>

      {/* LAYER A: FOREGROUND AURORA BLOBS (Translates at faster speed - max 25px) */}
      <motion.div style={{ x: xA, y: yA }} className="absolute inset-0">
        {/* Blob 1: Soft Sage */}
        <div
          className="absolute -left-[10%] -top-[5%] h-[60vw] w-[60vw] rounded-full opacity-[0.35]"
          style={{
            background: "oklch(0.85 0.07 140)",
            filter: "blur(100px)",
            animation: "aurora-blob-a 30s ease-in-out infinite",
          }}
        />

        {/* Blob 3: Cream glow */}
        <div
          className="absolute right-[5%] bottom-[5%] h-[52vw] w-[52vw] rounded-full opacity-[0.42]"
          style={{
            background: "oklch(0.97 0.02 85)",
            filter: "blur(120px)",
            animation: "aurora-blob-c 32s ease-in-out infinite",
          }}
        />
      </motion.div>

      {/* LAYER 3: SOFT LIGHT BEAMS (Translates at slowest speed - max 10px) */}
      <motion.div style={{ x: xLight, y: yLight }} className="absolute inset-0">
        <div
          className="absolute left-[25%] top-[10%] h-[40vw] w-[80vw] rotate-[22deg] rounded-full opacity-[0.14]"
          style={{
            background: "radial-gradient(ellipse at center, white 0%, transparent 70%)",
            filter: "blur(70px)",
            animation: "light-beam-a 25s ease-in-out infinite",
          }}
        />
        <div
          className="absolute right-[15%] bottom-[15%] h-[45vw] w-[85vw] rotate-[-12deg] rounded-full opacity-[0.11]"
          style={{
            background: "radial-gradient(ellipse at center, white 0%, transparent 75%)",
            filter: "blur(80px)",
            animation: "light-beam-b 30s ease-in-out infinite",
          }}
        />
      </motion.div>

      {/* LAYER 6: LUXURY GRAIN TEXTURE (Tactile Film Grain - 2.5% opacity) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.4 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
        }}
      />

      {/* Animated keyframes defined in a style block */}
      <style>{`
        @keyframes rotate-gradient {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes aurora-blob-a {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
          33% { transform: translate3d(8vw, -4vh, 0) scale(1.1) rotate(15deg); }
          66% { transform: translate3d(-4vw, 6vh, 0) scale(0.92) rotate(-10deg); }
        }
        @keyframes aurora-blob-b {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
          33% { transform: translate3d(-6vw, 8vh, 0) scale(0.9) rotate(-12deg); }
          66% { transform: translate3d(5vw, -6vh, 0) scale(1.12) rotate(15deg); }
        }
        @keyframes aurora-blob-c {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
          50% { transform: translate3d(8vw, 6vh, 0) scale(1.08) rotate(10deg); }
        }
        @keyframes aurora-blob-d {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
          50% { transform: translate3d(-10vw, -5vh, 0) scale(0.92) rotate(-12deg); }
        }
        @keyframes light-beam-a {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1) rotate(22deg); opacity: 0.14; }
          50% { transform: translate3d(3vw, -1vh, 0) scale(1.05) rotate(25deg); opacity: 0.22; }
        }
        @keyframes light-beam-b {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1) rotate(-12deg); opacity: 0.11; }
          50% { transform: translate3d(-2vw, 1vh, 0) scale(1.03) rotate(-9deg); opacity: 0.17; }
        }
      `}</style>
    </div>
  );
}
