"use client";

import React, { useEffect, useState } from "react";
import { useGameStore } from "./lib/game-store";
import { SUSPECTS, WEAPONS, ROOMS } from "./lib/game-engine";
import GameBoard from "./components/GameBoard";
import SpectatorDashboard from "./components/SpectatorDashboard";
import { getAddressFromPrivateKey, BRAGA_CONFIG } from "./lib/arkiv";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles,
  ServerCrash,
  Lock,
  Unlock,
  AlertTriangle,
  Copy,
  Check
} from "lucide-react";

export default function Home() {
  const {
    gameId,
    status,
    isPlaying,
    winner,
    envelope,
    encryptedEnvelope,
    transactionError,
    writePrivateKey,
    togglePlay,
    resetGame,
    initializeGame,
    executeSingleStep,
  } = useGameStore();

  const [initError, setInitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedHost, setCopiedHost] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sync mounting to prevent Next.js hydration mismatches on client-derived keys
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-running simulation step loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isPlaying && status === "playing" && gameId) {
      const tick = async () => {
        await executeSingleStep();
        timer = setTimeout(tick, 2000); // 2-second constant velocity ticks
      };
      timer = setTimeout(tick, 2000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, status, gameId, executeSingleStep]);

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

      {/* 2. Transaction Blocked Banner (Gas required) */}
      {mounted && transactionError && (
        <div className="w-full max-w-7xl mx-auto px-6 mt-4">
          <div className="relative overflow-hidden p-6 bg-gradient-to-r from-amber-950/20 via-red-950/10 to-amber-950/20 border border-amber-500/30 rounded-3xl shadow-[0_0_30px_rgba(245,158,11,0.15)] backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Ambient orange background glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-950/40 border border-amber-500/50 rounded-2xl text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse mt-0.5">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-black font-mono tracking-widest uppercase text-amber-300">
                    TRANSACTION BLOCKED — BRAGA GAS REQUIRED
                  </h3>
                  <p className="text-[11px] text-zinc-400 max-w-2xl leading-relaxed mt-1 font-sans">
                    The active AI agent attempted to submit a transaction to the Arkiv Braga testnet ledger, but the write failed due to a gas shortage. Please fund the host account below using the official Braga faucet to resume the match:
                  </p>
                  
                  {/* Host account address */}
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <div className="flex items-center justify-between gap-3 px-3.5 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-[10px] font-mono font-bold text-zinc-200 shadow-inner">
                      <span className="text-zinc-500 mr-1 select-none">HOST ADDRESS:</span>
                      <span className="select-all break-all">{getAddressFromPrivateKey(writePrivateKey)}</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(getAddressFromPrivateKey(writePrivateKey));
                          setCopiedHost(true);
                          setTimeout(() => setCopiedHost(false), 2000);
                        }}
                        className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-all"
                        title="Copy host address"
                      >
                        {copiedHost ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <a 
                      href={BRAGA_CONFIG.faucetUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold font-mono text-[10px] tracking-widest uppercase rounded-xl transition-all duration-300 shadow-[0_0_12px_rgba(6,182,212,0.3)] hover:scale-[1.02]"
                    >
                      Open Braga Faucet
                    </a>
                  </div>
                </div>
              </div>

              {/* Action error snippet detail */}
              <div className="flex flex-col items-end shrink-0 justify-center">
                <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest">RPC Error Message</span>
                <div className="max-w-[280px] bg-zinc-950/90 border border-zinc-900 px-3 py-2.5 rounded-2xl text-[9px] font-mono text-rose-450 max-h-16 overflow-y-auto mt-1 break-words shadow-inner leading-normal">
                  {transactionError}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Dashboard Layout Grid */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        
        {/* COLUMN 1: CONTROLS & BOARD (lg:col-span-5) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          {/* Sleek Low-Profile Playback Control Panel */}
          <div className="p-4 bg-zinc-950/40 border border-zinc-800/80 rounded-3xl backdrop-blur-xl shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shrink-0" />
              <h2 className="text-[9px] font-bold font-mono tracking-widest uppercase text-zinc-400">
                Match controls
              </h2>
            </div>

            {/* Main Minimal Action Controllers */}
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                disabled={status !== "playing" || loading}
                className={`py-2 px-4 rounded-xl font-bold font-mono text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 border transition-all duration-300 ${
                  isPlaying
                    ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-amber-500"
                    : "bg-cyan-600 hover:bg-cyan-500 border-cyan-500 text-zinc-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.2)] disabled:opacity-50"
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 shrink-0" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 shrink-0 fill-zinc-950" /> Play
                  </>
                )}
              </button>

              <button
                onClick={handleInit}
                disabled={loading}
                className="p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-rose-450 rounded-xl transition-all duration-300 flex items-center justify-center shadow"
                title="Reset & Initialize New Match"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
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

        {/* COLUMN 2: SPECTATOR DASHBOARD (lg:col-span-7) */}
        <section className="lg:col-span-7 flex flex-col gap-6 w-full h-full">
          <SpectatorDashboard />
        </section>

      </main>
    </div>
  );
}
