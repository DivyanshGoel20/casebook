"use client";

import React, { useState } from "react";
import { useGameStore } from "../lib/game-store";
import { SUSPECTS, WEAPONS, ROOMS } from "../lib/game-engine";
import { SuspectId, WeaponId, RoomId, NotebookStatus } from "../lib/game-types";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ScrollText, Play, Activity } from "lucide-react";

export default function SpectatorDashboard() {
  const { players, notebooks, logs, activePlayerIndex, disproveResult, selectedSuggestion } = useGameStore();
  const [activeTab, setActiveTab] = useState<"notebooks" | "timeline">("notebooks");

  const activePlayer = players[activePlayerIndex];

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      
      {/* Tab Controls: Notebooks vs Logs */}
      <div className="flex flex-col flex-1 bg-zinc-950/40 border border-zinc-800/80 rounded-3xl backdrop-blur-xl overflow-hidden shadow-2xl min-h-[550px]">
        <div className="flex border-b border-zinc-800 bg-zinc-950/80 p-1">
          <button
            onClick={() => setActiveTab("notebooks")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-bold font-mono uppercase tracking-widest rounded-2xl transition-all duration-300 ${
              activeTab === "notebooks" 
                ? "bg-zinc-900 border border-zinc-800 text-cyan-400 shadow-[0_4px_20px_rgba(6,182,212,0.15)]" 
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            <Brain className="w-4 h-4 text-cyan-400" />
            AI Detective Notebooks
          </button>
          
          <button
            onClick={() => setActiveTab("timeline")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-bold font-mono uppercase tracking-widest rounded-2xl transition-all duration-300 ${
              activeTab === "timeline" 
                ? "bg-zinc-900 border border-zinc-800 text-cyan-400 shadow-[0_4px_20px_rgba(6,182,212,0.15)]" 
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            <ScrollText className="w-4 h-4 text-cyan-400" />
            Spectator Timeline Logs
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1 p-5 overflow-y-auto max-h-[500px]">
          
          {/* TAB 1: AI NOTEBOOKS */}
          {activeTab === "notebooks" && (
            <div className="flex flex-col gap-6">
              
              {/* Informational overlay */}
              <AnimatePresence mode="wait">
                {selectedSuggestion && disproveResult ? (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-start gap-3 p-4 bg-cyan-950/20 border border-cyan-800/40 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.05)]"
                  >
                    <Activity className="w-4.5 h-4.5 text-cyan-400 animate-pulse mt-0.5" />
                    <div className="flex-1 text-[11px] font-mono leading-relaxed">
                      <span className="font-bold text-zinc-200 block uppercase tracking-wider mb-0.5">
                        Active Reasoner: {activePlayer?.name}
                      </span>
                      <span className="text-zinc-400">
                        Suggested <b className="text-cyan-300">{selectedSuggestion.suspect}</b> inside <b className="text-cyan-300">{selectedSuggestion.room.replace("_", " ")}</b> using <b className="text-cyan-300">{selectedSuggestion.weapon.replace("_", " ")}</b>. {disproveResult.text}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl">
                    <Activity className="w-4.5 h-4.5 text-zinc-500 mt-0.5" />
                    <div className="flex-1 text-[11px] font-mono leading-relaxed text-zinc-500 uppercase tracking-wider">
                      Waiting for active detective suggestion...
                    </div>
                  </div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {players.map((p) => {
                  const notebook = notebooks[p.id];
                  if (!notebook) return null;
                  const isActive = activePlayer?.id === p.id;

                  return (
                    <div 
                      key={p.id} 
                      className={`p-4 rounded-2xl bg-zinc-950/80 border transition-all duration-300 ${
                        isActive 
                          ? "border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.1)] bg-zinc-950" 
                          : p.eliminated 
                          ? "border-red-950/40 opacity-40 bg-zinc-950/40"
                          : "border-zinc-800/80"
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: p.color, boxShadow: `0 0 8px ${p.color}` }}
                          />
                          <span className="text-[11px] font-bold font-mono tracking-tight text-zinc-200">
                            {p.name}'s Notebook
                          </span>
                        </div>
                        {isActive && !p.eliminated && (
                          <span className="px-2 py-0.5 text-[8px] bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-bold rounded uppercase animate-pulse">
                            ACTIVE
                          </span>
                        )}
                        {p.eliminated && (
                          <span className="px-2 py-0.5 text-[8px] bg-red-950 text-red-400 border border-red-800/60 font-bold rounded uppercase">
                            OUT
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 text-[10px]">
                        {/* Suspects */}
                        <div>
                          <div className="text-zinc-500 font-bold font-mono mb-1 text-[8px] uppercase tracking-widest">Suspects</div>
                          <div className="grid grid-cols-2 gap-1.5 font-mono">
                            {SUSPECTS.map((s) => (
                              <div key={s.id} className="flex items-center justify-between px-2 py-1 bg-zinc-900/30 rounded-lg border border-zinc-800/40">
                                <span className="text-zinc-400 truncate pr-1 text-[9px]">{s.name}</span>
                                <NotebookBadge status={notebook.suspects[s.id]} />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Weapons */}
                        <div>
                          <div className="text-zinc-500 font-bold font-mono mb-1 text-[8px] uppercase tracking-widest">Weapons</div>
                          <div className="grid grid-cols-2 gap-1.5 font-mono">
                            {WEAPONS.map((w) => (
                              <div key={w.id} className="flex items-center justify-between px-2 py-1 bg-zinc-900/30 rounded-lg border border-zinc-800/40">
                                <span className="text-zinc-400 truncate pr-1 text-[9px]">{w.name.replace("_", " ")}</span>
                                <NotebookBadge status={notebook.weapons[w.id]} />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Rooms */}
                        <div>
                          <div className="text-zinc-500 font-bold font-mono mb-1 text-[8px] uppercase tracking-widest">Rooms</div>
                          <div className="grid grid-cols-2 gap-1.5 font-mono">
                            {ROOMS.filter(r => r.id !== "MAINFRAME").map((r) => (
                              <div key={r.id} className="flex items-center justify-between px-2 py-1 bg-zinc-900/30 rounded-lg border border-zinc-800/40">
                                <span className="text-zinc-400 truncate pr-1 text-[9px]">{r.name}</span>
                                <NotebookBadge status={notebook.rooms[r.id]} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SPECTATOR TIMELINE LOGS */}
          {activeTab === "timeline" && (
            <div className="flex flex-col gap-3">
              {logs.map((log) => {
                const playerState = players.find((p) => p.id === log.player);
                const color = playerState?.color || "#ffffff";

                return (
                  <div 
                    key={log.id} 
                    className="flex items-start gap-3.5 p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl hover:border-zinc-700 transition-colors duration-300"
                  >
                    <div className="mt-0.5">
                      {log.type === "dice" && <span className="text-base select-none">🎲</span>}
                      {log.type === "move" && <span className="text-base select-none">🏃</span>}
                      {log.type === "suggest" && <span className="text-base select-none">💡</span>}
                      {log.type === "disprove" && <span className="text-base select-none">👁️</span>}
                      {log.type === "fail_disprove" && <span className="text-base select-none">🔎</span>}
                      {log.type === "accuse_success" && <span className="text-base select-none">🏆</span>}
                      {log.type === "accuse_fail" && <span className="text-base select-none">❌</span>}
                      {log.type === "setup" && <span className="text-base select-none">⚙️</span>}
                    </div>

                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between mb-0.5">
                        <span style={{ color }} className="font-bold font-mono tracking-wide">
                          {playerState?.name || "Aether Manor"}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-mono">
                          Turn {log.turn} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-zinc-300 leading-relaxed font-sans">{log.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Subcomponent: Status badge for Notebook Cells
function NotebookBadge({ status }: { status: NotebookStatus }) {
  if (status === "HELD_BY_ME") {
    return (
      <span className="px-1 py-0.5 bg-emerald-950 border border-emerald-800/80 text-emerald-400 font-black rounded text-[7px] leading-none shrink-0">
        OWN
      </span>
    );
  }
  if (status === "ELIMINATED") {
    return (
      <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-500 font-black rounded text-[7px] line-through leading-none shrink-0">
        X
      </span>
    );
  }
  if (status === "HELD_BY_OTHER") {
    return (
      <span className="px-1 py-0.5 bg-cyan-950 border border-cyan-800/80 text-cyan-400 font-black rounded text-[7px] leading-none shrink-0">
        SHR
      </span>
    );
  }
  // Possible
  return (
    <span className="px-1 py-0.5 bg-zinc-950 border border-zinc-800 text-zinc-600 font-bold rounded text-[7px] leading-none shrink-0">
      ?
    </span>
  );
}
