"use client";

import React, { useEffect, useState } from "react";
import { useGameStore } from "./lib/game-store";
import { SUSPECTS, WEAPONS, ROOMS } from "./lib/game-engine";
import GameBoard from "./components/GameBoard";
import SpectatorDashboard from "./components/SpectatorDashboard";
import ArkivLedger from "./components/ArkivLedger";
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Gauge, 
  Sparkles,
  Info,
  ServerCrash,
  Lock,
  Unlock,
  Key
} from "lucide-react";

export default function Home() {
  const {
    gameId,
    status,
    isPlaying,
    gameSpeed,
    activeAction,
    winner,
    envelope,
    encryptedEnvelope,
    togglePlay,
    setGameSpeed,
    resetGame,
    initializeGame,
    executeSingleStep,
  } = useGameStore();

  const [initError, setInitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-running simulation step loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isPlaying && status === "playing" && gameId) {
      const tick = async () => {
        await executeSingleStep();
        timer = setTimeout(tick, gameSpeed);
      };
      timer = setTimeout(tick, gameSpeed);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, status, gameId, gameSpeed, executeSingleStep]);

  // Automated first-boot initialization
  useEffect(() => {
    const autoInit = async () => {
      setLoading(true);
      try {
        await initializeGame();
      } catch (err: any) {
        setInitError(err?.message || "Failed to initialize game environment");
      } finally {
        setLoading(false);
      }
    };
    autoInit();
  }, [initializeGame]);

  const handleInit = async () => {
    setLoading(true);
    setInitError(null);
    try {
      resetGame();
      await initializeGame();
    } catch (err: any) {
      setInitError(err?.message || "Failed to initialize game environment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none overflow-x-hidden pb-12">
      {/* Background radial glow spotlights */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* 1. Header Navigation Bar */}
      <header className="relative border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-cyan-600 to-rose-600 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Sparkles className="w-5 h-5 text-zinc-950" />
          </div>
          <div>
            <h1 className="text-sm font-black font-mono tracking-widest uppercase bg-gradient-to-r from-zinc-100 via-cyan-400 to-rose-400 bg-clip-text text-transparent">
              Aether Manor • Arkiv Cluedo
            </h1>
            <p className="text-[9px] font-mono text-zinc-500 tracking-widest uppercase mt-0.5">
              Decentralized Cryptographic Mystery Solver • Braga Testnet
            </p>
          </div>
        </div>

        {/* Live System indicators */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden sm:flex flex-col items-end leading-none">
            <span className="text-[8px] text-zinc-500 uppercase tracking-widest mb-0.5">Session ID</span>
            <span className="text-zinc-300 font-bold">{gameId || "PREPARING..."}</span>
          </div>
          
          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full shadow-inner">
            <div className={`w-1.5 h-1.5 rounded-full ${status === "playing" ? "bg-cyan-400 animate-pulse" : status === "finished" ? "bg-emerald-500" : "bg-zinc-600"}`} />
            <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-tight">
              {status}
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Dashboard Layout Grid */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        
        {/* COLUMN 1: CONTROLS & BOARD (lg:col-span-5) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          {/* Game Controller Panel */}
          <div className="p-5 bg-zinc-950/40 border border-zinc-800/80 rounded-3xl backdrop-blur-xl shadow-2xl">
            <h2 className="text-[10px] font-bold font-mono tracking-widest uppercase text-zinc-400 mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
              Match Playback Control Panel
            </h2>

            {/* Main Action Controllers */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                disabled={status !== "playing" || loading}
                className={`flex-1 py-3.5 px-4 rounded-2xl font-bold font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 border transition-all duration-300 ${
                  isPlaying
                    ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-850 text-amber-500 hover:border-zinc-700"
                    : "bg-cyan-600 hover:bg-cyan-500 border-cyan-500 text-zinc-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.25)] disabled:opacity-50"
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 shrink-0" /> Pause Match
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 shrink-0 fill-zinc-950" /> Spectate Auto-Play
                  </>
                )}
              </button>

              <button
                onClick={executeSingleStep}
                disabled={isPlaying || status !== "playing" || loading}
                className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-750 text-zinc-200 hover:text-cyan-400 rounded-2xl transition-all duration-300 disabled:opacity-20 disabled:text-zinc-600 disabled:border-zinc-900 flex items-center justify-center shadow"
                title="Execute Single Game Step"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={handleInit}
                disabled={loading}
                className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-750 text-zinc-200 hover:text-rose-400 rounded-2xl transition-all duration-300 flex items-center justify-center shadow"
                title="Reset & Initialize New Match"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Playback speed slider */}
            <div className="mt-5 pt-4 border-t border-zinc-850 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                <span className="flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" /> Action Step Velocity
                </span>
                <span className="text-zinc-300 font-bold">{Math.round(gameSpeed / 100) / 10}s</span>
              </div>
              <input
                type="range"
                min="400"
                max="4000"
                step="200"
                value={gameSpeed}
                onChange={(e) => setGameSpeed(Number(e.target.value))}
                className="w-full h-1 bg-zinc-900 border border-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Render Game Board */}
          {initError ? (
            <div className="p-8 border border-red-950/40 bg-red-950/15 rounded-3xl flex flex-col items-center justify-center text-center text-xs text-red-400">
              <ServerCrash className="w-8 h-8 mb-2 animate-bounce" />
              <span className="font-bold mb-1 uppercase tracking-wider">Failed to Sync to Arkiv Braga</span>
              <p className="opacity-70 leading-relaxed max-w-xs">{initError}</p>
              <button 
                onClick={handleInit} 
                className="mt-4 px-3.5 py-2 bg-red-900 hover:bg-red-800 text-zinc-100 rounded-lg font-bold transition-all uppercase text-[10px]"
              >
                Retry Setup
              </button>
            </div>
          ) : (
            <GameBoard />
          )}

          {/* PRIVATIZED CRYPTOGRAPHIC MURDER ENVELOPE PANEL */}
          {encryptedEnvelope && (
            <div className="p-4 bg-zinc-950/40 border border-zinc-800/80 rounded-3xl backdrop-blur-xl flex flex-col gap-3 shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-xl">
                    {status === "finished" ? (
                      <Unlock className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-cyan-400 animate-pulse" />
                    )}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-[10px] font-bold font-mono text-zinc-300 uppercase tracking-widest">
                      Tamper-Proof Murder Envelope
                    </span>
                    <span className="text-[8px] text-zinc-500 font-mono uppercase tracking-tight">
                      On-Chain Cryptographic Proof (RSA-OAEP)
                    </span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 text-[8px] font-bold font-mono rounded border uppercase ${
                  status === "finished" 
                    ? "bg-emerald-950 text-emerald-400 border-emerald-800/60" 
                    : "bg-cyan-950 text-cyan-400 border-cyan-800/60"
                }`}>
                  {status === "finished" ? "Decrypted" : "Secured"}
                </span>
              </div>

              {/* Decrypted Reveal or Hex Ciphertext display */}
              {status === "finished" && envelope ? (
                <div className="flex flex-col gap-2">
                  <div className="p-3 bg-emerald-950/15 border border-emerald-500/20 rounded-2xl text-center flex flex-col items-center justify-center gap-1 shadow-inner">
                    <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                      Envelope Successfully Solved!
                    </span>
                    <div className="flex gap-2 font-mono text-[10px] font-black text-zinc-200 mt-1 uppercase">
                      <span className="text-rose-400">{envelope.suspect}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-cyan-400">{envelope.weapon.replace("_", " ")}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-amber-400">{envelope.room.replace("_", " ")}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 font-mono">
                  <div className="p-2.5 bg-zinc-950/60 border border-zinc-900 rounded-xl flex flex-col gap-1">
                    <span className="text-[8px] text-zinc-500 uppercase tracking-wider font-bold">
                      On-Chain Commitment Ciphertext:
                    </span>
                    <div className="text-[8.5px] text-zinc-400 break-all select-all font-mono leading-normal bg-zinc-950 border border-zinc-900 p-2 rounded-lg leading-relaxed shadow-inner h-14 overflow-y-auto">
                      {encryptedEnvelope}
                    </div>
                  </div>
                  <p className="text-[8px] text-zinc-500 leading-normal italic text-center">
                    Commitment is securely locked on Arkiv Braga. Payload is strictly undecryptable during play.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* COLUMN 2: SPECTATOR INSIGHTS (lg:col-span-4) */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          <SpectatorDashboard />
        </section>

        {/* COLUMN 3: ARKIV LEDGER (lg:col-span-3) */}
        <section className="lg:col-span-3 h-full flex flex-col gap-6">
          <ArkivLedger />
        </section>

      </main>
    </div>
  );
}
