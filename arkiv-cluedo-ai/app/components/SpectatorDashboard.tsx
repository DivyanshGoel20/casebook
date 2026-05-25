"use client";

import React, { useState, useEffect } from "react";
import { useGameStore } from "../lib/game-store";
import { SUSPECTS, WEAPONS, ROOMS } from "../lib/game-engine";
import { SuspectId, WeaponId, RoomId, NotebookStatus } from "../lib/game-types";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ScrollText, Activity } from "lucide-react";

export default function SpectatorDashboard() {
  const { players, notebooks, logs, activePlayerIndex, disproveResult, selectedSuggestion, activeMonologue } = useGameStore();
  const [activeTab, setActiveTab] = useState<"notebooks" | "timeline">("notebooks");
  const [selectedAgentTab, setSelectedAgentTab] = useState<SuspectId>("CIPHER");
  const [mounted, setMounted] = useState(false);

  const activePlayer = players[activePlayerIndex];

  // Auto-sync active agent selection when their turn arrives
  useEffect(() => {
    setMounted(true);
    if (activePlayer?.id) {
      setSelectedAgentTab(activePlayer.id);
    }
  }, [activePlayer?.id]);

  if (!mounted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border border-zinc-850 bg-zinc-950/20 rounded-3xl min-h-[550px]">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none">
          Loading Spectator Dashboard...
        </span>
      </div>
    );
  }

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
        <div className="flex-1 p-5 overflow-y-auto max-h-[560px]">
          
          {/* TAB 1: AI NOTEBOOKS */}
          {activeTab === "notebooks" && (
            <div className="flex flex-col gap-5">
              
              {/* AI Reasoning / Informational suggestion overlay */}
              <AnimatePresence mode="wait">
                {activeMonologue ? (
                  <motion.div 
                    key="ai-monologue"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-start gap-3 p-4 bg-cyan-950/20 border border-cyan-800/40 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.08)] backdrop-blur-md"
                  >
                    <div 
                      className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 animate-pulse" 
                      style={{ backgroundColor: activePlayer?.color, boxShadow: `0 0 10px ${activePlayer?.color}` }}
                    />
                    <div className="flex-1 text-[11px] font-mono leading-relaxed">
                      <span className="font-extrabold text-zinc-200 block uppercase tracking-widest text-[9px] mb-1">
                        💭 {activePlayer?.name}'s Internal Monologue (0G Qwen AI)
                      </span>
                      <p className="text-zinc-350 italic font-sans text-xs">"{activeMonologue}"</p>
                    </div>
                  </motion.div>
                ) : selectedSuggestion && disproveResult ? (
                  <motion.div 
                    key="suggest-disprove"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-start gap-3 p-4 bg-cyan-950/20 border border-cyan-800/40 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.05)]"
                  >
                    <Activity className="w-4.5 h-4.5 text-cyan-400 animate-pulse mt-0.5 shrink-0" />
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
                  <div key="waiting" className="flex items-start gap-3 p-4 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl">
                    <Activity className="w-4.5 h-4.5 text-zinc-500 mt-0.5 shrink-0" />
                    <div className="flex-1 text-[11px] font-mono leading-relaxed text-zinc-500 uppercase tracking-wider">
                      Waiting for active detective thoughts...
                    </div>
                  </div>
                )}
              </AnimatePresence>

              {/* Horizontal Agent Selector Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-zinc-900 pb-3">
                {players.map((p) => {
                  const isSelected = selectedAgentTab === p.id;
                  const isActive = activePlayer?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedAgentTab(p.id)}
                      style={{
                        borderColor: isSelected ? p.color : "transparent",
                        color: isSelected ? "#f4f4f5" : "#71717a",
                        boxShadow: isSelected ? `0 0 12px ${p.color}25` : "none",
                      }}
                      className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-[9px] font-bold font-mono uppercase border transition-all duration-300 flex flex-col items-center gap-0.5 ${
                        isSelected 
                          ? "bg-zinc-900" 
                          : "bg-zinc-950/40 border-zinc-850/30 hover:border-zinc-850 hover:bg-zinc-900/40 hover:text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-1.5 h-1.5 rounded-full" 
                          style={{ backgroundColor: p.color, boxShadow: `0 0 6px ${p.color}` }}
                        />
                        <span>{p.name}</span>
                      </div>
                      <div className="flex gap-1 mt-0.5">
                        {isActive && (
                          <span className="text-[6.5px] px-1 bg-cyan-950 text-cyan-400 font-bold border border-cyan-900/60 rounded">
                            ACTIVE
                          </span>
                        )}
                        {p.eliminated && (
                          <span className="text-[6.5px] px-1 bg-red-950 text-red-400 font-bold border border-red-900/60 rounded">
                            OUT
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Agent secret ledger notebook details - Zero Clutter Layout */}
              {(() => {
                const p = players.find(player => player.id === selectedAgentTab);
                if (!p) return null;
                const notebook = notebooks[p.id];
                if (!notebook) return null;
                const isActive = activePlayer?.id === p.id;

                return (
                  <div className="animate-in fade-in duration-300">
                    {/* Header info */}
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-5">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: p.color, boxShadow: `0 0 10px ${p.color}` }}
                        />
                        <h4 className="text-[11px] font-black font-mono tracking-widest text-zinc-150 uppercase">
                          {p.name}'S SECRET ELIMINATION NOTEBOOK
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <span className="px-2 py-0.5 text-[8px] bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-black rounded uppercase tracking-wider animate-pulse">
                            Active turn
                          </span>
                        )}
                        {p.eliminated && (
                          <span className="px-2 py-0.5 text-[8px] bg-red-950 text-red-400 border border-red-800/60 font-black rounded uppercase tracking-wider">
                            Eliminated
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Flawlessly aligned 3-column deck */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
                      
                      {/* Column 1: Suspects */}
                      <div className="flex flex-col gap-3 min-w-0">
                        <h5 className="text-[9px] text-zinc-500 font-black uppercase tracking-widest border-b border-zinc-900 pb-1.5 mb-1 flex items-center justify-between">
                          <span>Suspects</span>
                          <span className="text-[8px] font-normal text-zinc-600">Status</span>
                        </h5>
                        <div className="flex flex-col gap-1.5">
                          {SUSPECTS.map((s) => {
                            const status = notebook.suspects[s.id];
                            return (
                              <div 
                                key={s.id} 
                                className="flex items-center justify-between px-3 py-2 bg-zinc-900/10 border border-zinc-900/50 rounded-xl hover:border-zinc-850 hover:bg-zinc-900/30 transition-all duration-200 min-w-0"
                              >
                                <span className={`text-[10px] font-bold min-w-0 truncate pr-1 ${status === "ELIMINATED" ? "text-zinc-600 line-through font-normal" : "text-zinc-300"}`}>
                                  {s.name}
                                </span>
                                <NotebookBadge status={status} />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Column 2: Weapons */}
                      <div className="flex flex-col gap-3 border-t md:border-t-0 md:border-l border-zinc-900 md:pl-4 min-w-0">
                        <h5 className="text-[9px] text-zinc-500 font-black uppercase tracking-widest border-b border-zinc-900 pb-1.5 mb-1 flex items-center justify-between">
                          <span>Weapons</span>
                          <span className="text-[8px] font-normal text-zinc-600">Status</span>
                        </h5>
                        <div className="flex flex-col gap-1.5">
                          {WEAPONS.map((w) => {
                            const status = notebook.weapons[w.id];
                            return (
                              <div 
                                key={w.id} 
                                className="flex items-center justify-between px-3 py-2 bg-zinc-900/10 border border-zinc-900/50 rounded-xl hover:border-zinc-850 hover:bg-zinc-900/30 transition-all duration-200 min-w-0"
                              >
                                <span className={`text-[10px] font-bold min-w-0 truncate pr-1 ${status === "ELIMINATED" ? "text-zinc-600 line-through font-normal" : "text-zinc-300"}`}>
                                  {w.name.replace("_", " ")}
                                </span>
                                <NotebookBadge status={status} />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Column 3: Rooms */}
                      <div className="flex flex-col gap-3 border-t md:border-t-0 md:border-l border-zinc-900 md:pl-4 min-w-0">
                        <h5 className="text-[9px] text-zinc-500 font-black uppercase tracking-widest border-b border-zinc-900 pb-1.5 mb-1 flex items-center justify-between">
                          <span>Locations</span>
                          <span className="text-[8px] font-normal text-zinc-600">Status</span>
                        </h5>
                        <div className="flex flex-col gap-1.5">
                          {ROOMS.filter(r => r.id !== "MAINFRAME").map((r) => {
                            const status = notebook.rooms[r.id];
                            return (
                              <div 
                                key={r.id} 
                                className="flex items-center justify-between px-3 py-2 bg-zinc-900/10 border border-zinc-900/50 rounded-xl hover:border-zinc-850 hover:bg-zinc-900/30 transition-all duration-200 min-w-0"
                              >
                                <span className={`text-[10px] font-bold min-w-0 truncate pr-1 ${status === "ELIMINATED" ? "text-zinc-600 line-through font-normal" : "text-zinc-300"}`}>
                                  {r.name}
                                </span>
                                <NotebookBadge status={status} />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}
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
                    <div className="mt-0.5 shrink-0">
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

// Subcomponent: Compact, aligned Status Badge for cells (strictly overflow-proof)
function NotebookBadge({ status }: { status: NotebookStatus }) {
  if (status === "HELD_BY_ME") {
    return (
      <span className="px-2 py-0.5 bg-emerald-950/50 border border-emerald-500/20 text-emerald-400 font-bold rounded-lg text-[8px] tracking-wider uppercase leading-none shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.1)]">
        Hand
      </span>
    );
  }
  if (status === "ELIMINATED") {
    return (
      <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-500 font-medium rounded-lg text-[8px] tracking-wider uppercase leading-none shrink-0">
        Ruled Out
      </span>
    );
  }
  if (status === "HELD_BY_OTHER") {
    return (
      <span className="px-2 py-0.5 bg-cyan-950/50 border border-cyan-500/20 text-cyan-400 font-bold rounded-lg text-[8px] tracking-wider uppercase leading-none shrink-0 shadow-[0_0_6px_rgba(6,182,212,0.1)]">
        Shared
      </span>
    );
  }
  // Possible
  return (
    <span className="px-2 py-0.5 bg-zinc-950 border border-zinc-900/60 text-zinc-500 font-bold rounded-lg text-[8px] tracking-wider uppercase leading-none shrink-0">
      Possible
    </span>
  );
}
